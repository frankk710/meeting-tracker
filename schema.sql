DROP TABLE IF EXISTS meetings;
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,          
    title TEXT NOT NULL,                             
    meeting_time TEXT NOT NULL,                      
    meeting_end_time TEXT,                         
    location TEXT NOT NULL,                          
    meeting_type TEXT DEFAULT '本地会',               
    department TEXT,                                 
    leader TEXT,                                     
    status TEXT DEFAULT '市级',                       
    notes TEXT,                                      
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP    
);
