import json

import requests
from bs4 import BeautifulSoup

url1 = "https://www.nmn.de/de/kalender/kalender.htm"
url2 = "https://www.staatstheater-nuernberg.de/spielplan-22-23"
url3 = "https://theater-erlangen.reservix.de/events"

category = None
title = None
subTitle = None
description = None
fromDate = None
toDate = None
ticket = None
ticketLink = None
notes = None
additional_param = None
contactTelephone = None
contactEmail = None
event_Iteration = None
event_cost = None

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"}

response1 = requests.get(url1, headers=headers)
response2 = requests.get(url2, headers=headers)
response3 = requests.get(url3, headers=headers)

soup1 = BeautifulSoup(response1.content, 'html.parser')
soup2 = BeautifulSoup(response2.content, 'html.parser')
soup3 = BeautifulSoup(response3.content, 'html.parser')

events = []
for item in soup1.find_all('div', 'termin'):
    for item1 in item.find_all('div', 'termin-head'):
        eventType = item1.find('span', 'event').text.strip()
        category = eventType
        print(f'Category: {eventType}')
    for item2 in item.find_all('div', 'termin-inhalt'):
        eventUrl = item2.find('h3').find('a', href=True)['href']
        ticketLink = eventUrl
        eventName = item2.find('h3').find('a', href=True).text.strip()
        title = eventName
        eventDetails = item2.find('h4')
        if type(eventDetails) != type(None):
            eventDetails = eventDetails.text.strip()
        description = eventDetails
        print(f'Title: {eventName}')
        print(f'eventDetails: {eventDetails}')
        print(f'Event Url: {eventUrl}')
        tempResponse = requests.get(eventUrl, headers=headers)
        tempSoap = BeautifulSoup(tempResponse.content, 'html.parser')
        scheduleDate = tempSoap.find_all('span', 'event_date')
        if(len(scheduleDate)==2):
            fromDate = scheduleDate[0].text.strip()
            toDate = scheduleDate[1].text.strip()
            print(f'fromDate: {scheduleDate[0].text.strip()}')
            print(f'toDate: {scheduleDate[1].text.strip()}')
        # Create an event dictionary
        nmm_event = {
            'category' : category,
            'title' : title,
            'subTitle' : subTitle,
            'description' : description,
            'fromDate' : fromDate,
            'toDate' : toDate,
            'ticket' : ticket,
            'ticketLink' : ticketLink,
            'notes' : notes,
            'additional_param' : additional_param,
            'contactTelephone' : contactTelephone,
            'contactEmail' : contactEmail,
            'event_Iteration' : event_Iteration,
            'event_cost' : event_cost
        }
        # Add the event to the list
    events.append(nmm_event)    
    # Save the extracted data in JSON format
    with open('mnn_events.json', 'w', encoding="utf-8") as file:
        json.dump(events, file, indent=4, ensure_ascii=False)
 

for item in soup2.find_all('section', 'section-large'):
    eventDate = item.find('p', 'underlined h4')
    if type(eventDate) != type(None):
        eventDate = eventDate.text.strip()
    fromDate = eventDate
    for event in item.find_all('section', 'event lined'):
        eventType = event.find('h4').text.strip()
        category = eventType
        eventName = event.find('h3').find('a').text.strip()
        title = eventName
        eventUrl = 'https://www.staatstheater-nuernberg.de/' + event.find('h3').find('a', href=True)['href']
        ticketLink = eventUrl
        eventDetails = event.find('div', 'noline')
        if type(eventDetails) != type(None):
            eventDetails = eventDetails.text.strip()
        description = eventDetails
        eventP = event.find_all('p')
        if (len(eventP) == 2):
            eventNote = eventP[0].text.strip()
            eventPlace = eventP[1].text.strip()
            notes = eventNote
            additional_param = eventPlace
        else:
            eventNote = eventP[1].text.strip()
            eventPlace = eventP[2].text.strip()
            notes = eventNote
            additional_param = eventPlace
        eventTicket = event.find('div', 'buttons noline')
        if type(eventTicket) != type(None):
            eventTicket = eventTicket.find('a', href=True)['href']
        ticket = eventTicket

        print(f'Event Type: {eventType}')
        print(f'Event Name: {eventName}')
        print(f'Event Url: {eventUrl}')
        print(f'Event Details: {eventDetails}')
        print(f'Event Schedule: {eventNote}')
        print(f'Event Date: {eventDate}')
        print(f'Event Place: {eventPlace}')
        print(f'Event Ticket: {eventTicket}')
        
        staatstheater_event = {
            'category': category,
            'title': title,
            'subTitle': subTitle,
            'description': description,
            'fromDate': fromDate,
            'toDate': toDate,
            'ticket': ticket,
            'ticketLink': ticketLink,
            'notes': notes,
            'additional_param': additional_param,
            'contactTelephone': contactTelephone,
            'contactEmail': contactEmail,
            'event_Iteration': event_Iteration,
            'event_cost': event_cost
        }
        events.append(staatstheater_event)
    with open('staatstheater_event.json', 'w', encoding="utf-8") as file:
        json.dump(events, file, indent=4, ensure_ascii=False)


for item in soup3.find_all('div', 'rx-component-list-item-event'):
    ticketUrl = item.find('figure').find('a', href=True)['href']
    ticketLink = ticketUrl
    eventName = item.find('h4').find('a', href=True).text.strip()
    title = eventName
    times = set()
    times = item.find_all('time')
    if (len(times) == 2):
        schedule = times[0].text.strip() + " to " + times[1].text.strip()
        fromDate = times[0].text.strip()
        toDate = times[1].text.strip()
    else:
        schedule = times[0].text.strip()
        fromDate = times[0].text.strip()
    eventDescription = item.find('a', href=True)['title']
    description = eventDescription
    ticketTitle = item.find('div', class_='rx-event-list-item-tickets').find('a')['title']
    subTitle = ticketTitle
    ticketInfo = item.find('div', class_='rx-event-list-item-tickets').find('p')
    eventLocations = item.find('div', class_='rx-event-list-item-city')
    if type(eventLocations) != type(None):
        eventLocations = eventLocations.find_all('p')
        i = 0
        if (len(eventLocations) > 0):
            eventLocation = eventLocations[0].text.strip()
            if (len(eventLocations) == 2):
                eventLocation = eventLocation + ", " + eventLocations[1].text.strip()
    #additional_param = eventLocations
    if type(ticketInfo) != type(None): ticketInfo = ticketInfo.text.strip()
    notes = ticketInfo

    print(f'Event Name: {eventName}')
    print(f'Event Schedule: {schedule}')
    print(f'Event Description: {eventDescription}')
    print(f'Event Location: {eventLocation}')
    print(f'Ticket Title: {ticketTitle}')
    print(f'Ticket url: {ticketUrl}')
    if type(ticketInfo) != type(None):
        print(f'Ticket Info: {ticketInfo}')
    theaterErlangen_event = {
        'category': category,
        'title': title,
        'subTitle': subTitle,
        'description': description,
        'fromDate': fromDate,
        'toDate': toDate,
        'ticket': ticket,
        'ticketLink': ticketLink,
        'notes': notes,
        'additional_param': additional_param,
        'contactTelephone': contactTelephone,
        'contactEmail': contactEmail,
        'event_Iteration': event_Iteration,
        'event_cost': event_cost
    }
    events.append(theaterErlangen_event)
    with open('theaterErlangen_event.json', 'w', encoding="utf-8") as file:
        json.dump(events, file, indent=4, ensure_ascii=False)