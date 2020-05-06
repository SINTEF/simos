import requests

def simpos():
    res = requests.post('http://localhost:5000/simos/1234', json={"mytext":"lalala"})
    
    print(res.json())

if __name__ == '__main__':
    simpos()