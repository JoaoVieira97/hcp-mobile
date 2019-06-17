import requests

def send_notifications(notifications):
    url = 'https://exp.host/--/api/v2/push/send'
    headers = {'Content-Type': 'application/json'}
    requests.post(url, json=notifications, headers=headers)