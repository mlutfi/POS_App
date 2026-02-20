package entity

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleOwner   Role = "OWNER"
	RoleOps     Role = "OPS"
	RoleCashier Role = "CASHIER"
)

func (Role) GormDataType() string {
	return "varchar(20)"
}

type User struct {
	ID                 string         `gorm:"column:id;primaryKey;type:varchar(255);default:gen_random_uuid()" json:"id"`
	Name               string         `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Email              string         `gorm:"column:email;type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash       *string        `gorm:"column:password_hash;type:varchar(255)" json:"-"`
	Role               Role           `gorm:"column:role;type:varchar(20);default:'CASHIER'" json:"role"`
	MustChangePassword bool           `gorm:"column:must_change_password;default:false" json:"mustChangePassword"`
	CreatedAt          time.Time      `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt          time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`

	// Relations
	Sales []Sale `gorm:"foreignKey:CashierID;constraint:OnDelete:Restrict" json:"sales,omitempty"`
}

func (User) TableName() string {
	return "users"
}
