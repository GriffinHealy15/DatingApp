using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        public MessagesController(IMapper mapper, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery]
        MessageParams messageParams)
        {
            messageParams.Username = User.GetUsername();

            var messages = await _unitOfWork.MessageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize,
            messages.TotalCount, messages.TotalPages);

            return messages;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var username = User.GetUsername();

            var message = await _unitOfWork.MessageRepository.GetMessage(id);
            Console.WriteLine("messagedel");
            Console.WriteLine(message);

            if (message.Sender.UserName != username && message.Recipient.UserName != username) return Unauthorized();

            if (message.Sender.UserName == username) message.SenderDeleted = true;

            if (message.Recipient.UserName == username) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
                _unitOfWork.MessageRepository.DeleteMessage(message);

            if (await _unitOfWork.Complete()) return Ok();

            return BadRequest("Problem deleting the message");
        }

        [HttpPost("markreaddelete")]
        public async Task<ActionResult> MarkMessagesDelete([FromBody] MyPayload ids)
        {
            var username = User.GetUsername();

            for (int i = 0; i < ids.Ids.Length; i++)
            {
                var message = await _unitOfWork.MessageRepository.GetMessage(ids.Ids[i]);

                if (message.Sender.UserName != username && message.Recipient.UserName != username) return Unauthorized();

                if (message.Sender.UserName == username) message.SenderDeleted = true;

                if (message.Recipient.UserName == username) message.RecipientDeleted = true;

                if (message.SenderDeleted && message.RecipientDeleted)
                    _unitOfWork.MessageRepository.DeleteMessage(message);
            }
            if (await _unitOfWork.Complete()) return Ok();

            return BadRequest("Problem deleting the messages");
        }

        public class MyPayload
        {
            public int[] Ids { get; set; }
        }

        [HttpPost("markread")]
        public async Task<ActionResult> MarkMessagesRead([FromBody] MyPayload ids)
        {
            for (int i = 0; i < ids.Ids.Length; i++)
            {
                var message = await _unitOfWork.MessageRepository.GetMessage(ids.Ids[i]);
                if (message.SetDateRead == "No")
                {
                    message.SetDateRead = "Yes";
                }
                else if (message.SetDateRead == "Yes")
                {
                    message.SetDateRead = "No";
                }
            }
            if (await _unitOfWork.Complete()) return Ok();
            return Ok();
        }

    }
}