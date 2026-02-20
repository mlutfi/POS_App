package auth

import (
	"pos_backend/helper"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler interface {
	Login(ctx *fiber.Ctx) error
	Logout(ctx *fiber.Ctx) error
	Me(ctx *fiber.Ctx) error
	ChangePassword(ctx *fiber.Ctx) error
}

type authHandler struct {
	UseCase AuthUseCase
}

func NewAuthHandler(useCase AuthUseCase) AuthHandler {
	return &authHandler{UseCase: useCase}
}

func (h *authHandler) Login(ctx *fiber.Ctx) error {
	request := new(LoginRequest)
	if err := ctx.BodyParser(request); err != nil {
		return helper.BadRequestResponse(ctx, "Invalid request body")
	}

	response, err := h.UseCase.Login(ctx.Context(), request)
	if err != nil {
		return helper.ErrorResponse(ctx, fiber.StatusUnauthorized, err.Error())
	}

	return helper.SuccessResponse(ctx, response)
}

func (h *authHandler) Logout(ctx *fiber.Ctx) error {
	return helper.SuccessResponse(ctx, fiber.Map{"ok": true})
}

func (h *authHandler) Me(ctx *fiber.Ctx) error {
	userId := ctx.Locals("userId").(string)
	user, err := h.UseCase.GetMe(ctx.Context(), userId)
	if err != nil {
		return helper.NotFoundResponse(ctx, "User not found")
	}
	return helper.SuccessResponse(ctx, user)
}

func (h *authHandler) ChangePassword(ctx *fiber.Ctx) error {
	userId := ctx.Locals("userId").(string)
	request := new(ChangePasswordRequest)
	if err := ctx.BodyParser(request); err != nil {
		return helper.BadRequestResponse(ctx, "Invalid request body")
	}

	err := h.UseCase.ChangePassword(ctx.Context(), userId, request)
	if err != nil {
		return helper.BadRequestResponse(ctx, err.Error())
	}

	return helper.SuccessResponseWithMessage(ctx, "Password changed successfully", nil)
}
