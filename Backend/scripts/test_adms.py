import requests
import time
import json

# Ajustar a la URL del backend de ControlAsistencia
BASE_URL = "http://localhost:3000" 
DEFAULT_SN = "FDEE250612046"

def print_menu():
    print("\n" + "="*40)
    print("   ADMS TEST MENU - ControlAsistencia")
    print("="*40)
    print("--- SIMULATE DEVICE (Reloj) ---")
    print("1. Send Heartbeat (cdata GET)")
    print("2. Upload Attendance (cdata POST)")
    print("3. Poll Command (getrequest)")
    print("")
    print("--- USER MANAGEMENT (API) ---")
    print("4. List Devices")
    print("5. Add User to Queue")
    print("6. Delete User from Device")
    print("")
    print("--- BIOMETRICS & SYNC (API) ---")
    print("12. Enroll Fingerprint")
    print("13. Enroll Face")
    print("17. Delete Fingerprint")
    print("14. Sync All Users from Device")
    print("15. Sync All Logs from Device")
    print("16. Sync All Fingerprints")
    print("")
    print("--- DEVICE CONTROL (API) ---")
    print("7. Sync Time")
    print("8. Reboot Device")
    print("11. View Command History")
    print("")
    print("0. Exit")
    print("="*40)

def main():
    print(f"Connecting to: {BASE_URL}")
    sn = input(f"Enter Device Serial Number [Default: {DEFAULT_SN}]: ") or DEFAULT_SN
    print(f"\n>>> ACTIVE SERIAL NUMBER: {sn} <<<\n")
    
    while True:
        print_menu()
        choice = input("Select an option: ")

        try:
            if choice == '1':
                res = requests.get(f"{BASE_URL}/iclock/cdata?sn={sn}")
                print(f"[DEVICE] Heartbeat sent. Server says: {res.text}")

            elif choice == '2':
                pin = input("User PIN [Default: 1]: ") or "1"
                now = time.strftime("%Y-%m-%d %H:%M:%S")
                data = f"{pin}\t{now}\t0\t1\t0"
                res = requests.post(f"{BASE_URL}/iclock/cdata?sn={sn}&table=ATTLOG", data=data)
                print(f"[DEVICE] Log sent for PIN {pin}. Server says: {res.text}")

            elif choice == '3':
                res = requests.get(f"{BASE_URL}/iclock/getrequest?sn={sn}")
                cmd = res.text.strip()
                print(f"[DEVICE] Polled command: {cmd}")
                if cmd != "OK" and cmd.startswith("C:"):
                    confirm = input("Confirm execution? (y/n): ")
                    if confirm.lower() == 'y':
                        # Formato C:ID:CONTENT
                        parts = cmd.split(":")
                        if len(parts) >= 2:
                            cmd_id = parts[1]
                            requests.post(f"{BASE_URL}/iclock/devicecmd?sn={sn}", data=f"ID={cmd_id}&Return=0")
                            print(f"[DEVICE] Confirmation ID={cmd_id} sent.")

            elif choice == '4':
                res = requests.get(f"{BASE_URL}/iclock/api/devices")
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '5':
                pin = input("PIN: ")
                name = input("Name: ")
                payload = {"action": "addUser", "payload": {"pin": pin, "name": name, "pri": 0}}
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json=payload)
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '6':
                pin = input("PIN to delete: ")
                payload = {"action": "deleteUser", "payload": {"pin": pin}}
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json=payload)
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '7':
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json={"action": "syncTime"})
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '8':
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json={"action": "reboot"})
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '11':
                res = requests.get(f"{BASE_URL}/iclock/api/commands/{sn}")
                print(f"Status: {res.status_code}")
                print(json.dumps(res.json(), indent=2))

            elif choice == '12':
                pin = input("PIN to enroll FP: ")
                fid = input("Finger ID (0-9) [Default 0]: ") or "0"
                payload = {"action": "enrollFP", "payload": {"pin": pin, "fid": int(fid)}}
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json=payload)
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '13':
                pin = input("PIN to enroll Face: ")
                payload = {"action": "enrollFace", "payload": {"pin": pin}}
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json=payload)
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '17':
                pin = input("PIN: ")
                fid = input("Finger ID (0-9): ")
                payload = {"action": "deleteFingerprint", "payload": {"pin": pin, "fid": int(fid)}}
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json=payload)
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '14':
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json={"action": "syncUsers"})
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '15':
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json={"action": "syncLogs"})
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '16':
                res = requests.post(f"{BASE_URL}/iclock/api/command/{sn}", json={"action": "syncFingers"})
                print(f"Status: {res.status_code}, Resp: {res.json()}")

            elif choice == '0':
                break
            else:
                print("Invalid choice.")
        
        except Exception as e:
            print(f"Error: {e}")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
