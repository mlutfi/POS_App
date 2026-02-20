package sale

type SaleItemRequest struct {
	ProductID string `json:"productId" validate:"required"`
	Qty       int    `json:"qty" validate:"required,gt=0"`
}

type CreateSaleRequest struct {
	CustomerName *string           `json:"customerName"`
	Items        []SaleItemRequest `json:"items" validate:"required,dive"`
}

type PayCashRequest struct {
	Amount int `json:"amount" validate:"required,gt=0"`
}

type SaleItemResponse struct {
	ID          string `json:"id"`
	ProductID   string `json:"productId"`
	ProductName string `json:"productName"`
	Qty         int    `json:"qty"`
	Price       int    `json:"price"`
	Subtotal    int    `json:"subtotal"`
}

type SaleResponse struct {
	ID           string             `json:"id"`
	CashierID    string             `json:"cashierId"`
	CashierName  string             `json:"cashierName"`
	CustomerName *string            `json:"customerName"`
	Status       string             `json:"status"`
	Total        int                `json:"total"`
	Items        []SaleItemResponse `json:"items"`
	CreatedAt    string             `json:"createdAt"`
}

type PaymentResponse struct {
	ID        string  `json:"id"`
	SaleID    string  `json:"saleId"`
	Method    string  `json:"method"`
	Provider  string  `json:"provider"`
	Amount    int     `json:"amount"`
	Status    string  `json:"status"`
	QRISUrl   *string `json:"qrisUrl"`
	CreatedAt string  `json:"createdAt"`
}

type DailyReportResponse struct {
	Date         string `json:"date"`
	TotalSales   int    `json:"totalSales"`
	TotalRevenue int    `json:"totalRevenue"`
	TotalItems   int    `json:"totalItems"`
	CashSales    int    `json:"cashSales"`
	QRISSales    int    `json:"qrisSales"`
}
