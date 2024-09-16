# ShopControl

User and Material tracking and equipment access control system built by Carleton College

## Overview

This is an electron application which runs inside the [Parcel wrapper](https://github.com/cc-is/Parcel). It is meant to act as a self-serve point-of-sale and signin station for use in student shops and makerspaces. It uses Google Sheets as a database by default, but can also store to a local database. It enables unique user tracking,  per-user material tracking, and per-user equipment access control.

## Features

_<span style="text-decoration:underline;">Single Command Installation</span>_: To install this application on a raspberry pi, it's as simple as installing Raspbian Lite, and running the command ```bash <(curl -sL https://parcel.makerspace.cc) -r 22-034-ShopControl
 -a CC-IS```.
