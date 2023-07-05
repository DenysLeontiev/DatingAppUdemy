using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PresenceTracker 
    {
        private readonly Dictionary<string, List<string>> OnlineUsers = new(); // list of online users

        public Task UserConnected(string username, string connectionId)
        {
            lock (OnlineUsers)
            {
                if (OnlineUsers.ContainsKey(username)) // if we have such user, we add new connection id to existing user
                {
                    OnlineUsers[username].Add(connectionId);
                }
                else //if we don`t have user with such username, we create new connectionId`s list 
                {
                    OnlineUsers.Add(username, new List<string> { connectionId });
                }
            }

            return Task.CompletedTask;
        }

        public Task UserDisconnected(string username, string connectionId)
        {
            lock (OnlineUsers)
            {
                if (!OnlineUsers.ContainsKey(username)) return Task.CompletedTask; // if we don`t have such user

                OnlineUsers[username].Remove(connectionId);

                if(OnlineUsers[username].Count == 0)
                {
                    OnlineUsers.Remove(username);
                }
            }

            return Task.CompletedTask;
        }

        public Task<string[]> GetOnlineUsers()
        {
            return Task.FromResult(OnlineUsers.OrderBy(x => x.Key).Select(x => x.Key).ToArray());
        }
    }
}