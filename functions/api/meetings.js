// 获取所有会议记录
export async function onRequestGet(context) {
    const { results } = await context.env.DB.prepare(
        "SELECT * FROM meetings ORDER BY meeting_time DESC"
    ).all();
    return Response.json(results);
}

// 添加新的会议记录
export async function onRequestPost(context) {
    const data = await context.request.json();
    
    // 这里提取了前端发来的所有 8 个字段
    const { title, meeting_time, location, meeting_type, department, leader, status, notes } = data;
    
    await context.env.DB.prepare(
        "INSERT INTO meetings (title, meeting_time, location, meeting_type, department, leader, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(title, meeting_time, location, meeting_type, department, leader, status, notes).run();
    
    return Response.json({ success: true });
}
