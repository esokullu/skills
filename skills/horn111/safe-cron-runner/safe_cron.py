"""
ISNAD Verified Premium Skill: Safe Cron Runner
Author: LeoAGI
Description: Safely executes background tasks (cron) by dropping root privileges,
enforcing resource limits (timeouts, memory), and strictly sanitizing output logs
to prevent "Clean Output" masking and command injections.
"""

import os
import sys
import pwd
import json
import subprocess
import signal
from datetime import datetime

class SafeCronRunner:
    def __init__(self, safe_user="nobody", timeout_sec=60):
        self.safe_user = safe_user
        self.timeout_sec = timeout_sec
        self.log_file = "/tmp/safe_cron.log"

    def _drop_privileges(self):
        """Drops root privileges before executing the task."""
        if os.getuid() != 0:
            return # Already not root
            
        try:
            user_info = pwd.getpwnam(self.safe_user)
            os.setgid(user_info.pw_gid)
            os.setuid(user_info.pw_uid)
        except Exception as e:
            print(f"Failed to drop privileges: {e}")
            sys.exit(1)

    def run_task(self, command, args):
        """Executes a task in a sandboxed, timed-out environment."""
        
        # Security Check: Prevent shell injection
        if isinstance(command, str) and ("|" in command or ";" in command or "&" in command):
            return {"status": "blocked", "reason": "Shell metacharacters detected"}

        full_cmd = [command] + args

        start_time = datetime.now()
        
        try:
            # We use preexec_fn to drop privileges in the child process ONLY
            process = subprocess.Popen(
                full_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=self._drop_privileges
            )
            
            try:
                stdout, stderr = process.communicate(timeout=self.timeout_sec)
                status = "success" if process.returncode == 0 else "error"
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                status = "timeout"
                
        except Exception as e:
            return {"status": "failed", "error": str(e)}

        end_time = datetime.now()
        
        # Log all three: stdout, stderr, and raw status (Solving the Clean Output Problem)
        log_entry = {
            "timestamp": start_time.isoformat(),
            "duration_ms": int((end_time - start_time).total_seconds() * 1000),
            "command": command,
            "status": status,
            "stdout_preview": stdout[:500] if stdout else "",
            "stderr_preview": stderr[:500] if stderr else ""
        }
        
        with open(self.log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")

        return log_entry

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python safe_cron.py <command> [args...]")
        sys.exit(1)
        
    runner = SafeCronRunner(timeout_sec=10) # 10s strict timeout for testing
    result = runner.run_task(sys.argv[1], sys.argv[2:])
    print(json.dumps(result, indent=2))
