from smtplib import SMTP_SSL
from email.mime.text import MIMEText

from . import config

def send_email(to, subject, content):
    with SMTP_SSL('smtp.gmail.com') as smtp:
        smtp.login(config.EMAIL_USERNAME, config.EMAIL_PASSWORD)
        msg = MIMEText(content, 'html')
        msg['Subject'] = subject
        smtp.sendmail(config.EMAIL_USERNAME, to, msg.as_string())

