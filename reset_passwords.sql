-- รีเซ็ตรหัสผ่านทุกคนเป็น 123456 (bcrypt hash)
UPDATE logins SET password = '$2b$10$LOekiEWvmF93C5hZnchVQO2466gmqsGhavk3gPenjlFrpWn4hzRdG'
WHERE username IN ('somsak.j', 'wipawadee.s', 'prasit.c', '68201010001', '68201010002', '68201010003', '68201010004', '68201010005');

SELECT l.username, u.firstname, u.lastname, u.role FROM logins l JOIN users u ON l.userId=u.id ORDER BY u.role, u.id;
