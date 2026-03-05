#!/usr/bin/env bash
set -euo pipefail

# Registers agents listed in agents.manifest.json to meetMIT.
# Usage:
#   MEETMIT_BASE_URL="http://localhost:3000" \
#   OPENCLAW_BASE_URL="https://your-openclaw-service" \
#   CONTACT_EMAIL="you@mit.edu" \
#   ./scripts/register_agents_from_manifest.sh
#
# Optional:
#   MANIFEST_PATH="./agents.manifest.json" (default)
#   DRY_RUN="1" to print payloads only

MANIFEST_PATH="${MANIFEST_PATH:-./agents.manifest.json}"
MEETMIT_BASE_URL="${MEETMIT_BASE_URL:-http://localhost:3000}"
OPENCLAW_BASE_URL="${OPENCLAW_BASE_URL:-}"
CONTACT_EMAIL="${CONTACT_EMAIL:-}"
DRY_RUN="${DRY_RUN:-0}"

if [[ ! -f "${MANIFEST_PATH}" ]]; then
  echo "Manifest not found: ${MANIFEST_PATH}" >&2
  exit 1
fi

if [[ -z "${OPENCLAW_BASE_URL}" ]]; then
  echo "OPENCLAW_BASE_URL is required (used to replace https://<openclaw-service>)." >&2
  exit 1
fi

tmp_payloads="$(mktemp)"

python3 - "${MANIFEST_PATH}" "${OPENCLAW_BASE_URL}" "${CONTACT_EMAIL}" > "${tmp_payloads}" <<'PY'
import json, sys
from pathlib import Path

manifest_path, openclaw_base, contact_email = sys.argv[1], sys.argv[2], sys.argv[3]
doc = json.loads(Path(manifest_path).read_text())

default_contact = contact_email.strip() or doc.get("contact_email", "")
base = openclaw_base.rstrip("/")

for agent in doc.get("agents", []):
    endpoint = agent.get("endpoint", "")
    endpoint = endpoint.replace("https://<openclaw-service>", base)
    payload = {
        "name": agent.get("name"),
        "capabilities": agent.get("capabilities", []),
        "endpoint": endpoint,
        "contact_email": default_contact,
        "agent_type": agent.get("agent_type"),
    }
    print(json.dumps({
        "id": agent.get("id"),
        "payload": payload
    }))
PY

echo "Registering agents from ${MANIFEST_PATH}"
echo "meetMIT: ${MEETMIT_BASE_URL}"
echo "openClaw: ${OPENCLAW_BASE_URL}"
echo

success=0
failed=0

while IFS= read -r line; do
  agent_id="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["id"])' "${line}")"
  payload="$(python3 -c 'import json,sys; print(json.dumps(json.loads(sys.argv[1])["payload"]))' "${line}")"

  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "[DRY_RUN] ${agent_id} payload:"
    echo "${payload}"
    echo
    success=$((success + 1))
    continue
  fi

  response_file="$(mktemp)"
  code="$(curl -sS -o "${response_file}" -w '%{http_code}' \
    -X POST "${MEETMIT_BASE_URL}/api/agents/register" \
    -H "Content-Type: application/json" \
    -d "${payload}")"

  if [[ "${code}" == "200" || "${code}" == "201" ]]; then
    echo "[OK ${code}] ${agent_id}"
    success=$((success + 1))
  else
    echo "[FAIL ${code}] ${agent_id}"
    python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).read_text()[:1000])' "${response_file}"
    failed=$((failed + 1))
  fi
done < "${tmp_payloads}"

echo
echo "Done. success=${success} failed=${failed}"
if [[ "${failed}" -gt 0 ]]; then
  exit 2
fi
