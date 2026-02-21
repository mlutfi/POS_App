package report

// ReportFilter holds filter parameters for report queries
type ReportFilter struct {
	StartDate     string `query:"startDate"`
	EndDate       string `query:"endDate"`
	CashierID     string `query:"cashierId"`
	PaymentMethod string `query:"paymentMethod"`
}

// ReportSummaryResponse holds aggregated summary stats
type ReportSummaryResponse struct {
	TotalRevenue      int     `json:"totalRevenue"`
	TotalTransactions int     `json:"totalTransactions"`
	TotalItems        int     `json:"totalItems"`
	AverageOrder      float64 `json:"averageOrder"`
	CashRevenue       int     `json:"cashRevenue"`
	CashTransactions  int     `json:"cashTransactions"`
	QRISRevenue       int     `json:"qrisRevenue"`
	QRISTransactions  int     `json:"qrisTransactions"`
}

// DailyChartPoint represents one day of revenue data for chart display
type DailyChartPoint struct {
	Date         string `json:"date"`
	Revenue      int    `json:"revenue"`
	Transactions int    `json:"transactions"`
}

// SaleDetailResponse represents a single sale row in the detail table
type SaleDetailResponse struct {
	ID            string  `json:"id"`
	CashierName   string  `json:"cashierName"`
	CustomerName  *string `json:"customerName"`
	Total         int     `json:"total"`
	PaymentMethod string  `json:"paymentMethod"`
	ItemCount     int     `json:"itemCount"`
	CreatedAt     string  `json:"createdAt"`
}

// CashierOption for filter dropdown
type CashierOption struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
