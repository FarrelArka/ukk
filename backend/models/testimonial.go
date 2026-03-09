package models

type Testimonial struct {
	IDTestimonial int     `json:"id_testimonial"`
	BookingID     int     `json:"booking_id"`
	IDUser        int     `json:"id_user"`
	Rating        float64 `json:"rating"`
	Comment       string  `json:"comment"`
	Status        string  `json:"status"`
	CreatedAt     string  `json:"created_at"`
}
