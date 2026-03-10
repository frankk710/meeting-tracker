// 1. 获取所有会议记录 (GET)
export async function onRequestGet(context) {
    const { results } = await context.env.DB.prepare(
        "SELECT * FROM meetings ORDER BY meeting_time DESC"
    ).all();
    return Response.json(results);
}

// 2. 添加新的会议记录 (POST)
export async function onRequestPost(context) {
    const data = await context.request.json();
    const { title, meeting_time, location, meeting_type, department, leader, status, notes } = data;
    
    await context.env.DB.prepare(
        "INSERT INTO meetings (title, meeting_time, location, meeting_type, department, leader, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(title, meeting_time, location, meeting_type, department, leader, status, notes).run();
    
    return Response.json({ success: true });
}

// 3. 修改会议记录 (PUT) - 【新增】
export async function onRequestPut(context) {
    const data = await context.request.json();
    const { id, title, meeting_time, location, meeting_type, department, leader, status, notes } = data;
    
    if (!id) return Response.json({ error: "缺少ID" }, { status: 400 });

    await context.env.DB.prepare(
        "UPDATE meetings SET title=?, meeting_time=?, location=?, meeting_type=?, department=?, leader=?, status=?, notes=? WHERE id=?"
    ).bind(title, meeting_time, location, meeting_type, department, leader, status, notes, id).run();
    
    return Response.json({ success: true });
}

// 4. 删除会议记录 (DELETE) - 【新增：带密码保护】
export async function onRequestDelete(context) {
    // 从请求头获取前端输入的密码
    const clientPassword = context.request.headers.get("X-Admin-Password");
    // 获取你在 Cloudflare 设置的真实密码（如果没有设置，默认是 123456 作为兜底）
    const serverPassword = context.env.ADMIN_PASSWORD || "123456";

    // 校验密码
    if (clientPassword !== serverPassword) {
        return Response.json({ error: "密码错误，无权删除！" }, { status: 403 });
    }

    // 获取要删除的记录 ID
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) return Response.json({ error: "缺少ID" }, { status: 400 });

    await context.env.DB.prepare("DELETE FROM meetings WHERE id=?").bind(id).run();
    
    return Response.json({ success: true });
}
