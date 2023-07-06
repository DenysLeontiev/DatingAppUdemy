using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Exceptions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper)
        {
            _messageRepository = messageRepository; 
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext(); // here we get HttpContext
            var currentUsername = Context.User.GetUsername();
            var otherUserName = httpContext.Request.Query["user"];
            var groupName = GetGroupName(currentUsername, otherUserName);

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName); // here we add new groupm for DMs(Direct Messages)

            var messages = await _messageRepository.GetMessageThread(currentUsername, otherUserName);
            await Clients.Group(groupName).SendAsync("RecieveMessageThread", messages);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto) // sends message via hub
        {
            var username = Context.User.GetUsername();

            if(username == createMessageDto.RecipientUsername.ToLower())
            {
                throw new HubException("You cant send messages to yourself");
            }

            var sender = await _userRepository.GetUserByUsernameAsync(username);
            if(sender == null)
            {
                throw new HubException("Sender is not found");
            }

            var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);
            if(recipient == null)
            {
                throw new HubException("Recipient is not found");
            }

            var message = new Message
            {
                Sender = sender,
                SenderUsername = sender.UserName,
                Recipient = recipient,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content,
            };

            _messageRepository.AddMessage(message);

            if(await _messageRepository.SaveAllAsync())
            {
                var groupName = GetGroupName(sender.UserName, recipient.UserName);
                
                 // sends to message to thise who are listening to NewMessage
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<Message>(message));
            }
        }

        public string GetGroupName(string caller, string otherName)
        {
            var stringComparison = string.CompareOrdinal(caller, otherName) < 0;
            return stringComparison ? $"{caller}-{otherName}" : $"{otherName}-{caller}";
        }
    }
}