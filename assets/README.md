# Higgsfield 2D 에셋 자동 생성 파이프라인

Codex 프로젝트에서 그대로 쓸 수 있는 최소 파이프라인입니다.
`asset_manifest.json`에 원하는 에셋을 나열하면, 스크립트가 Higgsfield API에
요청을 보내고 완료된 이미지를 `assets/<category>/<id>.png`로 저장합니다.

## 1. 설치

```bash
pip install requests
```

## 2. 인증

[cloud.higgsfield.ai](https://cloud.higgsfield.ai)에서 API 키 ID/시크릿을 발급받은 뒤:

```bash
export HF_API_KEY_ID="your-key-id"
export HF_API_KEY_SECRET="your-key-secret"
```

절대 소스코드나 저장소에 키를 직접 커밋하지 마세요. `.env` + `.gitignore` 권장.

## 3. 매니페스트 작성

`asset_manifest.json`에 필요한 에셋을 추가하세요:

```json
{
  "id": "goblin_enemy",
  "category": "characters",
  "prompt": "2D game enemy sprite, small green goblin with a club, side view, pixel art style, transparent background",
  "model": "higgsfield-ai/soul/v2/standard"
}
```

- `id`: 파일명이 됩니다 (예: `goblin_enemy.png`)
- `category`: 하위 폴더명 (`characters`, `backgrounds`, `items` 등 자유 지정)
- `prompt`: 원하는 스타일/구도를 최대한 구체적으로 (아트 스타일, 시점, 배경 유무 등)
- `model`: 사용할 Higgsfield 모델 엔드포인트 (기본값 그대로 둬도 됨)
- `params` (선택): 모델별 추가 파라미터가 필요하면 여기에 dict로 추가

## 4. 실행

```bash
# manifest 전체 생성
python generate_assets.py

# 특정 id만 재생성 (마음에 안 드는 에셋 다시 뽑을 때)
python generate_assets.py --only hero_character

# 다른 manifest 파일 사용
python generate_assets.py --manifest another_manifest.json
```

## 5. 결과 확인

```
assets/
  characters/
    hero_character.png
  backgrounds/
    forest_background.png
  items/
    health_potion_icon.png
```

실패한 항목은 최대 3번까지 자동 재시도하고, 그래도 실패하면 콘솔에 목록으로 표시됩니다.

## 다음 단계로 확장하고 싶다면

- **웹훅으로 전환**: 폴링 대신 완료 시점에 콜백을 받도록 바꾸면 대량 생성 시 더 효율적입니다.
- **Codex/CI 연동**: 이 스크립트를 빌드 전 단계(prebuild hook)로 걸어두면 매니페스트만 수정해도 에셋이 자동 갱신됩니다.
- **스타일 통일**: 모든 프롬프트 끝에 공통 스타일 가이드 문구(예: "consistent flat-shaded pixel art style, same color palette")를 붙이면 에셋 간 톤이 더 잘 맞습니다.
