import requests

def send_notifications(notifications):
    url = 'https://exp.host/--/api/v2/push/send'
    headers = {'Content-Type': 'application/json'}

    # "It may either be a single message object or an array of up to 100 messages"
    n = 100
    split = [notifications[i * n:(i + 1) * n] for i in range((len(notifications) + n - 1) // n )]
    
    for post in split:
    	requests.post(url, json=post, headers=headers)