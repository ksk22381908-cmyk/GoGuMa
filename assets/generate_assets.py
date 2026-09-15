#!/usr/bin/env python3
"""
Higgsfield 2D 에셋 자동 생성 파이프라인

asset_manifest.json에 정의된 프롬프트 목록을 읽어
Higgsfield API로 이미지를 생성하고, 완료되는 대로 자동 다운로드해서
assets/<category>/<id>.png 형태로 저장합니다.

사용법:
  export HF_API_KEY_ID="your-key-id"
  export HF_API_KEY_SECRET="your-key-secret"
  python generate_assets.py                     # manifest 전체 처리
  python generate_assets.py --manifest my.json   # 다른 manifest 지정
  python generate_assets.py --only hero_character  # 특정 id만 재생성
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

API_BASE = "https://api.higgsfield.ai"
DEFAULT_MODEL_ENDPOINT = "higgsfield-ai/soul/v2/standard"  # 기본 이미지 생성 모델
POLL_INTERVAL_SEC = 3
POLL_TIMEOUT_SEC = 180
MAX_RETRIES = 3


def get_auth_header() -> dict:
    key_id = os.environ.get("HF_API_KEY_ID")
    key_secret = os.environ.get("HF_API_KEY_SECRET")
    if not key_id or not key_secret:
        sys.exit(
            "오류: HF_API_KEY_ID / HF_API_KEY_SECRET 환경변수가 필요합니다.\n"
            "  export HF_API_KEY_ID=...\n  export HF_API_KEY_SECRET=..."
        )
    return {"Authorization": f"Key {key_id}:{key_secret}"}


def submit_generation(prompt: str, model_endpoint: str, headers: dict, extra_params: dict) -> dict:
    url = f"{API_BASE}/{model_endpoint}"
    payload = {"prompt": prompt, **extra_params}
    resp = requests.post(
        url,
        headers={**headers, "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def poll_until_done(status_url: str, headers: dict) -> dict:
    elapsed = 0
    while elapsed < POLL_TIMEOUT_SEC:
        resp = requests.get(status_url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status")
        if status in ("completed", "failed", "nsfw", "canceled"):
            return data
        time.sleep(POLL_INTERVAL_SEC)
        elapsed += POLL_INTERVAL_SEC
    raise TimeoutError(f"폴링 타임아웃 ({POLL_TIMEOUT_SEC}s): {status_url}")


def download_image(image_url: str, dest_path: Path) -> None:
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    resp = requests.get(image_url, timeout=60)
    resp.raise_for_status()
    dest_path.write_bytes(resp.content)


def guess_extension(url: str) -> str:
    ext = Path(urlparse(url).path).suffix
    return ext if ext else ".png"


def process_asset(asset: dict, headers: dict, assets_dir: Path) -> bool:
    asset_id = asset["id"]
    category = asset.get("category", "misc")
    prompt = asset["prompt"]
    model_endpoint = asset.get("model", DEFAULT_MODEL_ENDPOINT)
    extra_params = asset.get("params", {})

    print(f"[{asset_id}] 생성 요청 중... ({category})")

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            submit = submit_generation(prompt, model_endpoint, headers, extra_params)
            status_url = submit["status_url"]

            result = poll_until_done(status_url, headers)

            if result["status"] != "completed":
                print(f"[{asset_id}] 실패 (status={result['status']}), "
                      f"시도 {attempt}/{MAX_RETRIES}")
                if attempt == MAX_RETRIES:
                    return False
                continue

            image_url = result["images"][0]["url"]
            ext = guess_extension(image_url)
            dest = assets_dir / category / f"{asset_id}{ext}"
            download_image(image_url, dest)
            print(f"[{asset_id}] 완료 -> {dest}")
            return True

        except (requests.RequestException, TimeoutError, KeyError, IndexError) as e:
            print(f"[{asset_id}] 오류: {e} (시도 {attempt}/{MAX_RETRIES})")
            if attempt == MAX_RETRIES:
                return False
            time.sleep(2 * attempt)

    return False


def main():
    parser = argparse.ArgumentParser(description="Higgsfield 2D 에셋 자동 생성")
    parser.add_argument("--manifest", default="asset_manifest.json", help="에셋 목록 JSON 경로")
    parser.add_argument("--assets-dir", default="assets", help="출력 폴더")
    parser.add_argument("--only", help="이 id만 (재)생성")
    args = parser.parse_args()

    headers = get_auth_header()
    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        sys.exit(f"오류: manifest 파일을 찾을 수 없습니다: {manifest_path}")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assets = manifest.get("assets", [])
    if args.only:
        assets = [a for a in assets if a["id"] == args.only]
        if not assets:
            sys.exit(f"오류: id '{args.only}'를 manifest에서 찾을 수 없습니다.")

    assets_dir = Path(args.assets_dir)
    results = {"success": [], "failed": []}

    for asset in assets:
        ok = process_asset(asset, headers, assets_dir)
        (results["success"] if ok else results["failed"]).append(asset["id"])

    print("\n=== 요약 ===")
    print(f"성공: {len(results['success'])} / 전체: {len(assets)}")
    if results["failed"]:
        print(f"실패한 항목: {', '.join(results['failed'])}")
        sys.exit(1)


if __name__ == "__main__":
    main()
