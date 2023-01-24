import re
from time import time
import cv2, pandas
import requests
from datetime import date, datetime
import base64

first_frame = None
detection_list = [None,None]
times = []

video = cv2.VideoCapture(0)
print('')


def convertToBinaryData(filename):
    # Convert digital data to binary format
    path = filename
    with open(path, 'rb') as file:
        imageBase64 = base64.b64encode(file.read())
        url = 'http://localhost:2022/blob'
        date_time = str(datetime.now().strftime("%B%d%Y")+ str(datetime.now().strftime("%S")))
        file = './upload/image' + date_time + '.jpg'
        cv2.imwrite(file, frame)
        
        check =  {"date_time": str(datetime.now().strftime("%B %d, %Y - ")+ str(datetime.now().strftime("%H:%M %S sec"))), "image": str(imageBase64.decode('utf-8'))}
        sent = requests.post(url, json=check)
        print(sent.text)

    return imageBase64.decode('utf-8')

while True:

    check, frame = video.read()
    status = 0
    gray = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray,(5, 5),0)

    if first_frame is None:
        first_frame=gray
        continue
    
    delta_frame=cv2.absdiff(first_frame,gray)
    thresh_frame=cv2.threshold(delta_frame, 100, 255, cv2.THRESH_BINARY)[1]
    thresh_frame=cv2.dilate(thresh_frame, None, iterations=2)

    cnts,_=cv2.findContours(thresh_frame.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in cnts:
        if cv2.contourArea(contour) < 10000:
            continue
        status=1
        (x, y, w, h)=cv2.boundingRect(contour)
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 3)
        
    detection_list.append(status)
    detection_list=detection_list[-2:]

    
    if detection_list[-1] == 1 and detection_list[-2] == 0:
        times.append(datetime.now())
    if detection_list[-1] == 0 and detection_list[-2] == 1:
        times.append(datetime.now())
        print("MOTION DETECTED" ,datetime.now())
        convertToBinaryData(filename="./upload/image.jpg")

            
    cv2.imshow("MOTION DETECTOR CAMERA",frame)
    # WAITKEY
    key=cv2.waitKey(1)
    if key == ord('c'):
        break
    

video.release()
cv2.destroyAllWindows
