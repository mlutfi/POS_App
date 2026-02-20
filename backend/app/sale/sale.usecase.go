package sale

import (
	"context"
	"errors"
	"time"

	"pos_backend/entity"

	"gorm.io/gorm"
)

type SaleUseCase interface {
	Create(ctx context.Context, cashierId string, request *CreateSaleRequest) (*SaleResponse, error)
	GetByID(ctx context.Context, id string) (*SaleResponse, error)
	PayCash(ctx context.Context, id string, request *PayCashRequest) (*PaymentResponse, error)
	PayQRIS(ctx context.Context, id string) (*PaymentResponse, error)
	GetDailyReport(ctx context.Context, date string) (*DailyReportResponse, error)
}

type saleUseCase struct {
	DB         *gorm.DB
	Repository SaleRepository
}

func NewSaleUseCase(db *gorm.DB, repository SaleRepository) SaleUseCase {
	return &saleUseCase{
		DB:         db,
		Repository: repository,
	}
}

func (u *saleUseCase) Create(ctx context.Context, cashierId string, request *CreateSaleRequest) (*SaleResponse, error) {
	if len(request.Items) == 0 {
		return nil, errors.New("sale must have at least one item")
	}

	sale := &entity.Sale{
		CashierID:    cashierId,
		CustomerName: request.CustomerName,
		Status:       entity.SaleStatusPending,
		Total:        0,
	}

	var total int
	var saleItems []entity.SaleItem
	for _, item := range request.Items {
		product := new(entity.Product)
		if err := u.DB.WithContext(ctx).First(product, "id = ?", item.ProductID).Error; err != nil {
			return nil, errors.New("product not found: " + item.ProductID)
		}

		subtotal := product.Price * item.Qty
		total += subtotal

		saleItems = append(saleItems, entity.SaleItem{
			ProductID: item.ProductID,
			Qty:       item.Qty,
			Price:     product.Price,
			Subtotal:  subtotal,
		})
	}

	sale.Total = total
	sale.Items = saleItems

	err := u.Repository.Create(ctx, sale)
	if err != nil {
		return nil, err
	}

	return u.toResponse(sale), nil
}

func (u *saleUseCase) GetByID(ctx context.Context, id string) (*SaleResponse, error) {
	sale, err := u.Repository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return u.toResponse(sale), nil
}

func (u *saleUseCase) PayCash(ctx context.Context, id string, request *PayCashRequest) (*PaymentResponse, error) {
	sale, err := u.Repository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if sale.Status != entity.SaleStatusPending {
		return nil, errors.New("sale is not pending")
	}

	if request.Amount < sale.Total {
		return nil, errors.New("insufficient payment amount")
	}

	payment := &entity.Payment{
		SaleID:   sale.ID,
		Method:   entity.PaymentMethodCash,
		Provider: entity.PaymentProviderNone,
		Amount:   sale.Total,
		Status:   entity.PaymentStatusPaid,
	}

	err = u.Repository.CreatePayment(ctx, payment)
	if err != nil {
		return nil, err
	}

	sale.Status = entity.SaleStatusPaid
	err = u.Repository.Update(ctx, sale)
	if err != nil {
		return nil, err
	}

	return &PaymentResponse{
		ID:        payment.ID,
		SaleID:    payment.SaleID,
		Method:    string(payment.Method),
		Provider:  string(payment.Provider),
		Amount:    payment.Amount,
		Status:    string(payment.Status),
		CreatedAt: payment.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (u *saleUseCase) PayQRIS(ctx context.Context, id string) (*PaymentResponse, error) {
	sale, err := u.Repository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if sale.Status != entity.SaleStatusPending {
		return nil, errors.New("sale is not pending")
	}

	qrisUrl := "https://sandbox.midtrans.com/qris/" + sale.ID
	payment := &entity.Payment{
		SaleID:   sale.ID,
		Method:   entity.PaymentMethodQRIS,
		Provider: entity.PaymentProviderMidtrans,
		Amount:   sale.Total,
		Status:   entity.PaymentStatusPending,
		QRISUrl:  &qrisUrl,
	}

	err = u.Repository.CreatePayment(ctx, payment)
	if err != nil {
		return nil, err
	}

	return &PaymentResponse{
		ID:        payment.ID,
		SaleID:    payment.SaleID,
		Method:    string(payment.Method),
		Provider:  string(payment.Provider),
		Amount:    payment.Amount,
		Status:    string(payment.Status),
		QRISUrl:   payment.QRISUrl,
		CreatedAt: payment.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (u *saleUseCase) GetDailyReport(ctx context.Context, date string) (*DailyReportResponse, error) {
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	sales, err := u.Repository.GetDailySales(ctx, date)
	if err != nil {
		return nil, err
	}

	report := &DailyReportResponse{
		Date:         date,
		TotalSales:   len(sales),
		TotalRevenue: 0,
		TotalItems:   0,
		CashSales:    0,
		QRISSales:    0,
	}

	for _, sale := range sales {
		report.TotalRevenue += sale.Total
		report.TotalItems += len(sale.Items)

		for _, payment := range sale.Payments {
			if payment.Method == entity.PaymentMethodCash && payment.Status == entity.PaymentStatusPaid {
				report.CashSales++
			} else if payment.Method == entity.PaymentMethodQRIS && payment.Status == entity.PaymentStatusPaid {
				report.QRISSales++
			}
		}
	}

	return report, nil
}

func (u *saleUseCase) toResponse(sale *entity.Sale) *SaleResponse {
	var items []SaleItemResponse
	for _, item := range sale.Items {
		productName := ""
		if item.Product != nil {
			productName = item.Product.Name
		}
		items = append(items, SaleItemResponse{
			ID:          item.ID,
			ProductID:   item.ProductID,
			ProductName: productName,
			Qty:         item.Qty,
			Price:       item.Price,
			Subtotal:    item.Subtotal,
		})
	}

	cashierName := ""
	if sale.Cashier != nil {
		cashierName = sale.Cashier.Name
	}

	return &SaleResponse{
		ID:           sale.ID,
		CashierID:    sale.CashierID,
		CashierName:  cashierName,
		CustomerName: sale.CustomerName,
		Status:       string(sale.Status),
		Total:        sale.Total,
		Items:        items,
		CreatedAt:    sale.CreatedAt.Format(time.RFC3339),
	}
}
