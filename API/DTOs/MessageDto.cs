namespace API.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; } // for message id
        public string Content { get; set; } // context of the message
        public DateTime? DateRead { get; set; }
        public DateTime MessageSend { get; set; }
        public int SenderId { get; set; }
        public string SenderUsername { get; set; }
        public string SenderPhotoUrl { get; set; }
        public int RecipientId { get; set; }
        public string RecipientUsername { get; set; }
        public string RecipientPhotoUrl { get; set; }
    }
}