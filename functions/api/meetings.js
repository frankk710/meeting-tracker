// 通用权限检查函数
async function checkAuth(request, env) {
    // 1. 验证全局网页访问密码 (Web Access Password)
    const webPassword = request.headers.get("X-Web-Password");
    const serverWebPassword = env.WEB_PASSWORD; // Cloudflare 后台设置的变量

    if (webPassword !== serverWebPassword) {
        return new Response(JSON.stringify({ error: "未授权访问，请重新登录" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    return null; // 验证通过
}

// 1. 获取所有会议记录 (GET)
export async function onRequestGet(context) {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const { results } = await context.env.DB.prepare(
        "SELECT * FROM meetings ORDER BY meeting_time DESC"
    ).all();
    return Response.json(results);
}

// 2. 添加新的会议记录 (POST)
export async function onRequestPost(context) {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const data = await context.request.json();
    const { title, meeting_time, location, meeting_type, department, leader, status, notes } = data;
    
    await context.env.DB.prepare(
        "INSERT INTO meetings (title, meeting_time, location, meeting_type, department, leader, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(title, meeting_time, location, meeting_type, department, leader, status, notes).run();
    
    return Response.json({ success: true });
}

// 3. 修改会议记录 (PUT)
export async function onRequestPut(context) {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const data = await context.request.json();
    const { id, title, meeting_time, location, meeting_type, department, leader, status, notes } = data;
    
    if (!id) return Response.json({ error: "缺少ID" }, { status: 400 });

    await context.env.DB.prepare(
        "UPDATE meetings SET title=?, meeting_time=?, location=?, meeting_type=?, department=?, leader=?, status=?, notes=? WHERE id=?"
    ).bind(title, meeting_time, location, meeting_type, department, leader, status, notes, id).run();
    
    return Response.json({ success: true });
}

// 4. 删除会议记录 (DELETE) - 【双重保护：访问密码 + 管理员删除密码】
export async function onRequestDelete(context) {
    // 首先检查网页访问权限
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    // 其次检查管理员删除密码
    const clientAdminPassword = context.request.headers.get("X-Admin-Password");
    const serverAdminPassword = context.env.ADMIN_PASSWORD || "123456";

    if (clientAdminPassword !== serverAdminPassword) {
        return Response.json({ error: "管理员密码错误，无权删除！" }, { status: 403 });
    }

    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) return Response.json({ error: "缺少ID" }, { status: 400 });

    await context.env.DB.prepare("DELETE FROM meetings WHERE id=?").bind(id).run();
    
    return Response.json({ success: true });
}
