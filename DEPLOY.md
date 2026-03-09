# ตั้งค่า Auto Deploy (GitHub Actions → Server)

เมื่อ push ขึ้น branch `main` ระบบจะ deploy ไปที่เซิร์ฟเวอร์โดยอัตโนมัติ (หรือกด Run workflow เองจากแท็บ Actions)

---

## สิ่งที่ต้องมีบนเซิร์ฟเวอร์ (122.154.74.196)

1. **เปิด SSH** และมี user ที่ใช้ key ได้
2. **ติดตั้ง Docker + Docker Compose** (แอปและ MySQL รันในชุด container เดียวกัน ไม่ต้องใช้ DB เก่าบนเซิร์ฟเวอร์)
3. **โฟลเดอร์ที่เก็บโปรเจกต์** เช่น `/var/www/spvc-dve`

### ขั้นตอนบนเซิร์ฟเวอร์ (ทำครั้งเดียว)

```bash
# สร้างโฟลเดอร์
sudo mkdir -p /var/www/spvc-dve
cd /var/www/spvc-dve

# Clone repo
sudo git clone https://github.com/shellclub/spvc-dve.git .

# สร้าง .env สำหรับ docker-compose (รหัส MySQL)
cp .env.example .env
nano .env   # แก้ MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD ตามต้องการ

# สร้าง .env.production สำหรับแอป (DATABASE_URL ถูก compose ตั้งให้อัตโนมัติ)
nano .env.production
```

เนื้อหาใน `.env.production` (อย่างน้อยต้องมี):

```env
AUTH_SECRET="สร้างค่าใหม่ เช่น รัน: openssl rand -base64 32"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://122.154.74.196"
```

- **ไม่ต้องใส่ DATABASE_URL** ใน .env.production — docker-compose จะตั้งให้ชี้ไปที่ container MySQL อัตโนมัติ

```bash
# ตั้งสิทธิ์โฟลเดอร์ให้ user ที่ใช้ SSH deploy
sudo chown -R YOUR_DEPLOY_USER:YOUR_DEPLOY_USER /var/www/spvc-dve
```

---

## ตั้งค่า GitHub Secrets

ไปที่ Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name       | ค่า | หมายเหตุ |
|-------------------|-----|----------|
| `DEPLOY_HOST`     | `122.154.74.196` | IP หรือ hostname เซิร์ฟเวอร์ |
| `DEPLOY_USER`     | ชื่อ user ที่ใช้ SSH (เช่น `root` หรือ `admin`) | ต้องเป็น user ที่มีสิทธิ์เข้าโฟลเดอร์โปรเจกต์และรัน docker |
| `SSH_PRIVATE_KEY` | เนื้อหา private key ทั้งก้อน (จาก `cat ~/.ssh/id_rsa`) | ใช้คู่กับ public key ที่ใส่ในเซิร์ฟเวอร์ |
| `DEPLOY_PATH`     | (ไม่บังคับ) โฟลเดอร์ที่ clone repo ไว้ เช่น `/var/www/spvc-dve` | ไม่ตั้งจะใช้ `/var/www/spvc-dve` |
| `DEPLOY_SSH_PORT` | (ไม่บังคับ) พอร์ต SSH ถ้าไม่ใช่ 22 | เช่น `22` |

### สร้าง SSH Key (ถ้ายังไม่มี)

รันบน **เครื่องคุณ (Mac)** ไม่ใช่บนเซิร์ฟเวอร์:

```bash
# 1) สร้าง key (ไฟล์จะอยู่ที่ ~/.ssh/spvc_deploy และ ~/.ssh/spvc_deploy.pub)
ssh-keygen -t ed25519 -C "github-deploy-spvc" -f ~/.ssh/spvc_deploy -N ""
```

```bash
# 2) ใส่ public key ลงเซิร์ฟเวอร์ (แทน user ด้วย user ที่ใช้ SSH จริง เช่น root หรือ tavispvc)
ssh-copy-id -i ~/.ssh/spvc_deploy.pub user@122.154.74.196
# ถ้าใช้ user tavispvc:
# ssh-copy-id -i ~/.ssh/spvc_deploy.pub tavispvc@122.154.74.196
```

```bash
# 3) ดู private key เพื่อ copy ไปใส่ใน GitHub Secret ชื่อ SSH_PRIVATE_KEY
cat ~/.ssh/spvc_deploy
```

- คัดลอกผลลัพธ์จาก `cat` ทั้งหมด (จาก `-----BEGIN` ถึง `-----END ... KEY-----`) ไปวางใน **Settings → Secrets → SSH_PRIVATE_KEY**

#### ถ้า Deploy ขึ้น error `ssh: no key found` หรือ `unable to authenticate`

หมายความว่า GitHub อ่านค่า `SSH_PRIVATE_KEY` ไม่ได้ (มักเพราะ copy วาง key ผิดรูปแบบ):

1. **เปิดไฟล์ private key** บนเครื่องคุณ (ไม่ใช่ใน repo):
   ```bash
   cat ~/.ssh/spvc_deploy
   ```
2. **คัดลอกทั้งหมด** จากบรรทัด `-----BEGIN OPENSSH PRIVATE KEY-----` ถึง `-----END OPENSSH PRIVATE KEY-----` (รวม 2 บรรทัดนี้)
3. **อย่าเพิ่ม/ตัดช่องว่างหรือบรรทัด** — วางตรงๆ ในช่อง Value ของ Secret
4. ไปที่ **Settings → Secrets and variables → Actions** → กด **แก้ไข (ปากกา)** ที่ `SSH_PRIVATE_KEY` → **ลบค่าเก่า** แล้ววาง key ใหม่ทั้งหมด → Save
5. ลอง **Run workflow** อีกครั้ง

ถ้า key เป็นแบบ RSA (เก่า) จะขึ้นต้นด้วย `-----BEGIN RSA PRIVATE KEY-----` ก็ใช้ได้ แค่ต้องครบทุกบรรทัด

---

## หมายเหตุสำคัญ

- ข้อมูล **web (admin/Admin@1234)** และ **Portainer / phpMyAdmin** ที่คุณให้มา เป็นการเข้าใช้ panel หรือเว็บ ไม่ได้ใช้ใน workflow นี้ โดย workflow ใช้เฉพาะ **SSH (user + private key)** เพื่อเข้าเซิร์ฟเวอร์แล้วรันคำสั่ง deploy
- **ห้าม** ใส่รหัสผ่านหรือ key จริงในโค้ดหรือในไฟล์ใน repo ต้องใช้เฉพาะผ่าน GitHub Secrets
- หลัง deploy แอปจะรันที่พอร์ต **3000** บนเซิร์ฟเวอร์ ถ้าจะให้เข้าได้ผ่านพอร์ต 80/443 ต้องตั้ง reverse proxy (เช่น Nginx) เองบนเซิร์ฟเวอร์

---

## วิธี deploy

- **อัตโนมัติ:** push ขึ้น branch `main` (หรือ merge PR เข้า main)
- **มือ:** ไปที่แท็บ **Actions** → เลือก workflow **Deploy to Server** → **Run workflow**

---

## เช็กว่า deploy สำเร็จ

- แท็บ **Actions** ใน repo ต้องไม่มี error
- บนเซิร์ฟเวอร์: `docker ps` ควรเห็น container **spvc-dve-app-1** และ **spvc-dve-mysql-1** (หรือชื่อโฟลเดอร์-project)
- เข้าเว็บได้ที่ `http://122.154.74.196:3000`
- ครั้งแรกแอปจะรัน `prisma migrate deploy` ให้เอง (สร้างตารางใน MySQL)

---

## ถ้า Deploy ไม่สำเร็จ

1. **ดู error จริง:** ไปที่ **Actions** → คลิกที่ run ที่แดง (failed) → คลิก job **deploy** → ดูข้อความใน **Deploy via SSH** (บรรทัดที่แดงคือจุดที่ล้ม)
2. **กรณีที่พบบ่อย:**
   - **ssh: no key found** / **unable to authenticate** → ค่า `SSH_PRIVATE_KEY` ผิดรูปแบบ (ดูหัวข้อ "ถ้า Deploy ขึ้น error ssh: no key found" ด้านบน)
   - **Permission denied (publickey)** → เช็กว่า `SSH_PRIVATE_KEY` ครบ (รวมบรรทัด BEGIN/END), และ public key ใส่ในเซิร์ฟเวอร์แล้ว (`~/.ssh/authorized_keys` ของ DEPLOY_USER)
   - **ไม่มีโฟลเดอร์ ... บนเซิร์ฟเวอร์** → ต้องเข้า SSH ไปสร้างโฟลเดอร์และ clone เองก่อน เช่น `mkdir -p /var/www/spvc-dve && git clone https://github.com/shellclub/spvc-dve.git /var/www/spvc-dve` แล้วสร้างไฟล์ `.env` และ `.env.production`
   - **docker: command not found** หรือ **docker compose: command not found** → บนเซิร์ฟเวอร์ต้องติดตั้ง Docker (และ Docker Compose) ให้ DEPLOY_USER รันได้
   - **Permission denied** ตอนรัน docker → ให้ user นั้นอยู่ในกลุ่ม docker: `sudo usermod -aG docker DEPLOY_USER` แล้ว logout/login ใหม่
