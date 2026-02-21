package report

import (
	"fmt"
	"pos_backend/helper"

	"github.com/gofiber/fiber/v2"
)

type ReportHandler interface {
	GetSummary(ctx *fiber.Ctx) error
	GetChartData(ctx *fiber.Ctx) error
	GetSalesDetail(ctx *fiber.Ctx) error
	ExportExcel(ctx *fiber.Ctx) error
	GetCashiers(ctx *fiber.Ctx) error
}

type reportHandler struct {
	UseCase ReportUseCase
}

func NewReportHandler(useCase ReportUseCase) ReportHandler {
	return &reportHandler{UseCase: useCase}
}

func (h *reportHandler) parseFilter(ctx *fiber.Ctx) *ReportFilter {
	return &ReportFilter{
		StartDate:     ctx.Query("startDate"),
		EndDate:       ctx.Query("endDate"),
		CashierID:     ctx.Query("cashierId"),
		PaymentMethod: ctx.Query("paymentMethod"),
	}
}

func (h *reportHandler) GetSummary(ctx *fiber.Ctx) error {
	filter := h.parseFilter(ctx)
	summary, err := h.UseCase.GetSummary(ctx.Context(), filter)
	if err != nil {
		return helper.InternalServerErrorResponse(ctx, err.Error())
	}
	return helper.SuccessResponse(ctx, summary)
}

func (h *reportHandler) GetChartData(ctx *fiber.Ctx) error {
	filter := h.parseFilter(ctx)
	data, err := h.UseCase.GetChartData(ctx.Context(), filter)
	if err != nil {
		return helper.InternalServerErrorResponse(ctx, err.Error())
	}
	return helper.SuccessResponse(ctx, data)
}

func (h *reportHandler) GetSalesDetail(ctx *fiber.Ctx) error {
	filter := h.parseFilter(ctx)
	details, err := h.UseCase.GetSalesDetail(ctx.Context(), filter)
	if err != nil {
		return helper.InternalServerErrorResponse(ctx, err.Error())
	}
	return helper.SuccessResponse(ctx, details)
}

func (h *reportHandler) ExportExcel(ctx *fiber.Ctx) error {
	filter := h.parseFilter(ctx)
	data, err := h.UseCase.ExportExcel(ctx.Context(), filter)
	if err != nil {
		return helper.InternalServerErrorResponse(ctx, err.Error())
	}

	filename := "laporan_penjualan"
	if filter.StartDate != "" && filter.EndDate != "" {
		filename = fmt.Sprintf("laporan_%s_%s", filter.StartDate, filter.EndDate)
	}

	ctx.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.xlsx", filename))
	return ctx.Send(data)
}

func (h *reportHandler) GetCashiers(ctx *fiber.Ctx) error {
	cashiers, err := h.UseCase.GetCashiers(ctx.Context())
	if err != nil {
		return helper.InternalServerErrorResponse(ctx, err.Error())
	}
	return helper.SuccessResponse(ctx, cashiers)
}
