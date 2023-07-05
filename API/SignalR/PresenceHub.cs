using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
   // [Authorize] // we only want Authorized Users to have access to PresenceHub(handles user 'offline' or 'online' functionality)
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker _tracker;

        public PresenceHub(PresenceTracker tracker)
        {
            _tracker = tracker;
        }

        public override async Task OnConnectedAsync()
        { 
            await _tracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
            // UserIsOnline we listen to that on client
            await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUsername()); // here we notify all the users, that a new user has connected

            var onlineUsers = await _tracker.GetOnlineUsers();
            // here we are listening to who is currently online
            await Clients.All.SendAsync("GetOnlineUsers", onlineUsers); // notify all users about who is currently online
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await _tracker.UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);
            // UserIsOffline we listen to that on client
            await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUsername()); // user has been disconnected

            var onlineUsers = await _tracker.GetOnlineUsers();
            await Clients.All.SendAsync("GetOnlineUsers", onlineUsers); // notify all users about who is currently onlin

            await base.OnDisconnectedAsync(exception);
            
        }
    }
}