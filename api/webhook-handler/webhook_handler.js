from fastapi import FastAPI, Request, Response
import httpx
import os

app = FastAPI()

# Replace with your Make.com webhook URL
MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/a7ym9xsmjo2ltitmz9yq2b99dxlx5cvo"

@app.api_route("/webhook", methods=["GET", "POST"])
async def webhook(request: Request):
    if request.method == "GET":
        # Handle Strava webhook verification
        params = request.query_params
        hub_mode = params.get('hub.mode')
        hub_challenge = params.get('hub.challenge')
        hub_verify_token = params.get('hub.verify_token')

        # Optionally, verify the token
        # if hub_verify_token != 'YOUR_VERIFY_TOKEN':
        #     return Response(content='Verification token mismatch', status_code=403)

        return {"hub.challenge": hub_challenge}

    elif request.method == "POST":
        # Forward the POST request to Make.com webhook URL
        json_body = await request.json()
        headers = {"Content-Type": "application/json"}

        async with httpx.AsyncClient() as client:
            response = await client.post(MAKE_WEBHOOK_URL, json=json_body, headers=headers)

        # Respond to Strava with 200 OK
        return Response(status_code=200)