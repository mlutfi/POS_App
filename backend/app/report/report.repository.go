package report

import (
	"context"
	"time"

	"pos_backend/entity"

	"gorm.io/gorm"
)

type ReportRepository interface {
	GetFilteredSales(ctx context.Context, filter *ReportFilter) ([]entity.Sale, error)
	GetDailyAggregates(ctx context.Context, filter *ReportFilter) ([]DailyChartPoint, error)
	GetCashiers(ctx context.Context) ([]CashierOption, error)
}

type reportRepository struct {
	DB *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{DB: db}
}

func (r *reportRepository) applyFilters(query *gorm.DB, filter *ReportFilter) *gorm.DB {
	if filter.StartDate != "" {
		query = query.Where("sales.created_at >= ?", filter.StartDate+" 00:00:00")
	}
	if filter.EndDate != "" {
		query = query.Where("sales.created_at <= ?", filter.EndDate+" 23:59:59")
	}
	if filter.CashierID != "" {
		query = query.Where("sales.cashier_id = ?", filter.CashierID)
	}
	// Payment method filter is handled after join with payments table
	return query
}

func (r *reportRepository) GetFilteredSales(ctx context.Context, filter *ReportFilter) ([]entity.Sale, error) {
	var sales []entity.Sale
	query := r.DB.WithContext(ctx).
		Preload("Cashier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Payments").
		Where("sales.status = ?", entity.SaleStatusPaid)

	query = r.applyFilters(query, filter)

	// If payment method filter is set, join payments table
	if filter.PaymentMethod != "" {
		query = query.Joins("JOIN payments ON payments.sale_id = sales.id").
			Where("payments.method = ? AND payments.status = ?", filter.PaymentMethod, entity.PaymentStatusPaid)
	}

	query = query.Order("sales.created_at DESC")
	err := query.Find(&sales).Error
	return sales, err
}

func (r *reportRepository) GetDailyAggregates(ctx context.Context, filter *ReportFilter) ([]DailyChartPoint, error) {
	var results []DailyChartPoint

	query := r.DB.WithContext(ctx).
		Table("sales").
		Select("DATE(sales.created_at) as date, COALESCE(SUM(sales.total), 0) as revenue, COUNT(sales.id) as transactions").
		Where("sales.status = ?", entity.SaleStatusPaid)

	query = r.applyFilters(query, filter)

	if filter.PaymentMethod != "" {
		query = query.Joins("JOIN payments ON payments.sale_id = sales.id").
			Where("payments.method = ? AND payments.status = ?", filter.PaymentMethod, entity.PaymentStatusPaid)
	}

	query = query.Group("DATE(sales.created_at)").Order("date ASC")

	rows, err := query.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var point DailyChartPoint
		var date time.Time
		if err := rows.Scan(&date, &point.Revenue, &point.Transactions); err != nil {
			return nil, err
		}
		point.Date = date.Format("2006-01-02")
		results = append(results, point)
	}

	return results, nil
}

func (r *reportRepository) GetCashiers(ctx context.Context) ([]CashierOption, error) {
	var cashiers []CashierOption
	err := r.DB.WithContext(ctx).
		Table("users").
		Select("id, name").
		Where("deleted_at IS NULL").
		Order("name ASC").
		Scan(&cashiers).Error
	return cashiers, err
}
