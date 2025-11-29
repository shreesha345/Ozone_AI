"""
WebSocket Test Client
Continuous testing script for WebSocket connection to the misinformation detection server.

This script sends periodic test messages to the WebSocket endpoint and displays responses
for debugging and connection testing purposes.
"""
import asyncio
import websockets

async def continuous_test():
    uri = "ws://localhost:8000/ws/analyze"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            counter = 0
            while True:
                # 1. Send data to server
                message = f"Hello Server {counter}"
                await websocket.send(message)
                print(f"> Sent: {message}")
                
                # 2. Wait for response
                response = await websocket.recv()
                print(f"< Received: {response}")
                
                counter += 1
                await asyncio.sleep(1)  # Wait 1 second before next message
                
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(continuous_test())
