import os
import subprocess
import json
import secrets
from pathlib import Path

def main():
    # 1. Read secrets from backend/.env.local safely
    env_local_path = Path("backend/.env.local")
    if not env_local_path.exists():
        print("❌ Error: backend/.env.local not found!")
        return

    database_url = None
    direct_url = None
    with open(env_local_path, "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                database_url = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("DIRECT_URL="):
                direct_url = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("DATABASE_URL_UNPOOLED=") and not direct_url:
                direct_url = line.split("=", 1)[1].strip().strip('"').strip("'")

    if not database_url:
        print("❌ Error: DATABASE_URL not found in backend/.env.local!")
        return
    if not direct_url:
        direct_url = database_url

    print("✅ Successfully retrieved Neon database credentials locally.")
    print("🔒 Credential protection: All secrets remain masked and will never be printed.")

    jwt_secret = secrets.token_hex(32)
    jwt_refresh_secret = secrets.token_hex(32)

    # 2. Build the command arguments array
    cmd = [
        "render", "services", "create",
        "--name", "recircuit-api",
        "--type", "web_service",
        "--repo", "https://github.com/anishwathvs/ReCircuit-Circular-E-waste-managament",
        "--branch", "main",
        "--runtime", "node",
        "--root-directory", "backend",
        "--build-command", "npm install && npx prisma generate && npm run build",
        "--start-command", "npm run start",
        "--health-check-path", "/api/health",
        "--plan", "free",
        "--region", "oregon",
        "--auto-deploy",
        "--env-var", f"NODE_ENV=production",
        "--env-var", f"PORT=10000",
        "--env-var", f"DATABASE_URL={database_url}",
        "--env-var", f"DIRECT_URL={direct_url}",
        "--env-var", f"JWT_SECRET={jwt_secret}",
        "--env-var", f"JWT_REFRESH_SECRET={jwt_refresh_secret}",
        "--env-var", "CLIENT_URL=https://recircuit-circular-e-waste-managament.vercel.app",
        "--env-var", "CORS_ORIGIN=https://recircuit-circular-e-waste-managament.vercel.app,https://*.vercel.app",
        "--env-var", "ALLOW_DEMO_LOGIN=false",
        "--output", "json"
    ]

    print("🚀 Initiating Render Web Service creation...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"❌ Render creation failed (exit code {result.returncode}):")
        # Sanitize any output to ensure database_url or secrets are not printed
        sanitized_err = result.stderr.replace(database_url, "[REDACTED]").replace(direct_url, "[REDACTED]")
        print(sanitized_err)
        return

    try:
        service_data = json.loads(result.stdout)
        # Handle list or dict response
        if isinstance(service_data, list) and len(service_data) > 0:
            svc = service_data[0].get("service", service_data[0])
        elif isinstance(service_data, dict):
            svc = service_data.get("service", service_data)
        else:
            svc = {}

        svc_id = svc.get("id", "Unknown")
        svc_name = svc.get("name", "recircuit-api")
        svc_url = svc.get("serviceDetails", {}).get("url") or svc.get("url", "Pending assignment")
        dashboard_url = svc.get("dashboardUrl", f"https://dashboard.render.com/web/{svc_id}")

        print("🎉 Render Web Service created successfully!")
        print(f"📌 Service Name: {svc_name}")
        print(f"🆔 Service ID: {svc_id}")
        print(f"🌐 Public URL: {svc_url}")
        print(f"📊 Dashboard URL: {dashboard_url}")

        with open("backend/.render_service.json", "w") as out:
            json.dump({
                "serviceId": svc_id,
                "serviceName": svc_name,
                "serviceUrl": svc_url,
                "dashboardUrl": dashboard_url
            }, out, indent=2)

    except Exception as e:
        print("✅ Command executed successfully, raw sanitized output:")
        sanitized_out = result.stdout.replace(database_url, "[REDACTED]").replace(direct_url, "[REDACTED]")
        print(sanitized_out[:500])

if __name__ == "__main__":
    main()
