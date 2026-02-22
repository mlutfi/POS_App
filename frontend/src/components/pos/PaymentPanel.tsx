"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { salesApi, Sale } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Banknote, QrCode, Loader2, CheckCircle, XCircle, Sparkles, ArrowRight, Printer, RefreshCw, AlertCircle } from "lucide-react"
import { createPortal } from "react-dom"
import { ReceiptModal } from "./ReceiptModal"
import QRCode from "qrcode"

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

interface PaymentPanelProps {
  cartItems: CartItem[]
  total: number
  sale: Sale | null
  setSale: (sale: Sale | null) => void
  onClear: () => void
  onPaidSuccess: () => void
  customerName: string
}

export function PaymentPanel({
  cartItems,
  total,
  sale,
  setSale,
  onClear,
  onPaidSuccess,
  customerName,
}: PaymentPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | null>(null)
  const [cashAmount, setCashAmount] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [mounted, setMounted] = useState(false)

  // QRIS state
  const [qrisData, setQrisData] = useState<{
    id: string
    qrisUrl: string | null
    providerRef: string | null
    status: string
  } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrisStatus, setQrisStatus] = useState<"PENDING" | "PAID" | "EXPIRED" | "FAILED">("PENDING")
  const [pollingCount, setPollingCount] = useState(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Ensure portals only render on client
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true)
  }

  /** Generate QR Data URL from a QRIS string */
  const generateQrDataUrl = useCallback(async (qrisString: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(qrisString, {
        width: 280,
        margin: 2,
        color: { dark: "#1e1b4b", light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error("Failed to generate QR code:", err)
    }
  }, [])

  /** Start polling Midtrans for QRIS payment status */
  const startPolling = useCallback((saleId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      try {
        const result = await salesApi.getQRISStatus(saleId)
        setPollingCount((c) => c + 1)

        if (result.status === "PAID") {
          clearInterval(pollingRef.current!)
          setQrisStatus("PAID")
          setShowSuccess(true)
          onPaidSuccess()
        } else if (result.status === "EXPIRED" || result.status === "FAILED") {
          clearInterval(pollingRef.current!)
          setQrisStatus(result.status as "EXPIRED" | "FAILED")
          toast({
            title: "Pembayaran Gagal",
            description: `Status QRIS: ${result.status}`,
            variant: "destructive",
          })
        }
      } catch {
        // Ignore polling errors silently
      }
    }, 3000) // Poll every 3 seconds
  }, [onPaidSuccess, toast])

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCreateSale = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Keranjang kosong",
        variant: "destructive",
      })
      return null
    }

    try {
      const saleData = await salesApi.create(
        cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        customerName || undefined
      )
      setSale(saleData)
      return saleData
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat transaksi",
        variant: "destructive",
      })
      return null
    }
  }

  const handleCashPayment = async () => {
    if (!sale) return

    const amount = parseInt(cashAmount)
    if (isNaN(amount) || amount < total) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran kurang",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await salesApi.payCash(sale.id, amount)
      setShowSuccess(true)
      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil",
      })
      onPaidSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memproses pembayaran",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQRISPayment = async (currentSale: Sale) => {
    setLoading(true)
    try {
      const result = await salesApi.payQRIS(currentSale.id)
      setQrisData(result)
      setQrisStatus("PENDING")
      setPollingCount(0)

      if (result.qrisUrl) {
        await generateQrDataUrl(result.qrisUrl)
      }

      // Start polling for payment status
      startPolling(currentSale.id)

      toast({
        title: "QR Code Siap",
        description: "Scan QR code menggunakan aplikasi e-wallet",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat QRIS",
        variant: "destructive",
      })
      setPaymentMethod(null)
    } finally {
      setLoading(false)
    }
  }

  const handleStartPayment = async (method: "cash" | "qris") => {
    setPaymentMethod(method)
    const currentSale = sale || (await handleCreateSale())
    if (!currentSale) {
      setPaymentMethod(null)
      return
    }

    if (method === "qris") {
      await handleQRISPayment(currentSale)
    }
  }

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setPaymentMethod(null)
    setCashAmount("")
    setShowSuccess(false)
    setQrisData(null)
    setQrDataUrl(null)
    setQrisStatus("PENDING")
    onClear()
  }

  const handleRefreshQRIS = async () => {
    if (!sale) return
    if (pollingRef.current) clearInterval(pollingRef.current)
    await handleQRISPayment(sale)
  }

  const change = parseInt(cashAmount) - total

  // ===== Success Screen =====
  if (showSuccess) {
    const receiptData = {
      saleId: sale?.id || "",
      items: cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        subtotal: item.price * item.qty,
      })),
      total,
      cashAmount: parseInt(cashAmount) || total,
      change: Math.max(0, (parseInt(cashAmount) || total) - total),
      paymentMethod: paymentMethod as "cash" | "qris",
      cashierName: sale?.cashierName || "",
      customerName: customerName || "",
      createdAt: sale?.createdAt || new Date().toISOString(),
    }

    const successOverlay = mounted ? createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-scale-in">
          {/* Green top banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 pt-8 pb-16 text-center relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-xl ring-4 ring-white/30">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 animate-bounce shadow-sm">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-white tracking-wide">Pembayaran Berhasil!</h3>
              <p className="mt-1 text-sm text-emerald-100">Transaksi telah selesai</p>
            </div>
          </div>

          {/* Content card */}
          <div className="-mt-8 mx-4 rounded-2xl bg-white border border-slate-100 shadow-lg px-5 pt-5 pb-4 space-y-3">
            {change > 0 && (
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Kembalian</p>
                <p className="text-2xl font-extrabold text-amber-700 mt-0.5">{formatPrice(change)}</p>
              </div>
            )}

            <div className="space-y-1 text-xs text-slate-500 border border-slate-100 rounded-xl px-4 py-3 bg-slate-50">
              <div className="flex justify-between">
                <span>No. Transaksi</span>
                <span className="font-mono font-semibold text-slate-700">{sale?.id?.slice(0, 8).toUpperCase() || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tagihan</span>
                <span className="font-bold text-slate-700">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-semibold capitalize">{paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-6 pt-3 space-y-2">
            <button
              onClick={() => setShowReceipt(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk
            </button>
            <button
              onClick={handleReset}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>,
      document.body
    ) : null;

    return (
      <>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="mt-3 text-sm text-slate-400 font-medium">Transaksi Selesai</p>
        </div>

        {successOverlay}

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          data={receiptData}
        />
      </>
    )
  }

  // ===== Empty Cart =====
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          <Banknote className="h-7 w-7 text-slate-300" />
        </div>
        <p className="mt-3 text-sm text-slate-400 font-medium">Tidak ada item untuk dibayar</p>
      </div>
    )
  }

  // ===== Cash Payment Flow =====
  if (paymentMethod === "cash") {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Pembayaran Tunai</h3>
          <button
            onClick={() => setPaymentMethod(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Jumlah Bayar
          </label>
          <input
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Masukkan jumlah"
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-sm text-slate-700 placeholder-slate-300 outline-none transition-all duration-200 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
          />
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {[total, total + 10000, total + 20000, total + 50000, 100000, 150000].map((amount) => (
            <button
              key={amount}
              onClick={() => setCashAmount(amount.toString())}
              className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:scale-95"
            >
              {formatPrice(amount)}
            </button>
          ))}
        </div>

        {parseInt(cashAmount) >= total && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 animate-fade-in">
            <p className="text-xs text-emerald-500 font-medium">Kembalian</p>
            <p className="text-sm font-bold text-emerald-700">
              {formatPrice(change)}
            </p>
          </div>
        )}

        <button
          onClick={handleCashPayment}
          disabled={loading || parseInt(cashAmount) < total}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-200/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Banknote className="h-4 w-4" />
              Bayar Sekarang
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    )
  }

  // ===== QRIS Payment Flow =====
  if (paymentMethod === "qris") {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Pembayaran QRIS</h3>
          <button
            onClick={() => setPaymentMethod(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code Area */}
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
              <p className="mt-2 text-xs text-slate-400">Membuat QR Code...</p>
            </div>
          ) : qrisStatus === "EXPIRED" || qrisStatus === "FAILED" ? (
            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl bg-red-50 border-2 border-dashed border-red-200">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="mt-2 text-xs font-semibold text-red-500">
                {qrisStatus === "EXPIRED" ? "QR Code Kedaluwarsa" : "Pembayaran Gagal"}
              </p>
            </div>
          ) : qrDataUrl ? (
            <div className="relative">
              {/* QR code image */}
              <div className="rounded-2xl overflow-hidden border-4 border-violet-100 shadow-lg shadow-violet-100/50 p-2 bg-white">
                <img
                  src={qrDataUrl}
                  alt="QRIS Payment QR Code"
                  width={200}
                  height={200}
                  className="rounded-xl"
                />
              </div>
              {/* QRIS badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1 shadow-lg">
                <QrCode className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">QRIS</span>
              </div>
            </div>
          ) : (
            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
              <QrCode className="h-12 w-12 text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">QR tidak tersedia</p>
            </div>
          )}
        </div>

        {/* Amount + Status */}
        {!loading && qrDataUrl && qrisStatus === "PENDING" && (
          <div className="space-y-2">
            <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3 text-center">
              <p className="text-xs text-violet-500 font-medium">Total Pembayaran</p>
              <p className="text-xl font-extrabold text-violet-700">{formatPrice(total)}</p>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-slate-500">
                Menunggu pembayaran... ({pollingCount > 0 ? `cek ke-${pollingCount}` : "mulai"})
              </p>
            </div>
            <p className="text-center text-xs text-slate-400">
              Scan dengan QRIS-compatible e-wallet (GoPay, OVO, Dana, dll)
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {(qrisStatus === "EXPIRED" || qrisStatus === "FAILED") && (
            <button
              onClick={handleRefreshQRIS}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Buat QR Baru
            </button>
          )}
          <button
            onClick={handleReset}
            className="w-full rounded-xl bg-white border border-slate-200 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            Batalkan
          </button>
        </div>
      </div>
    )
  }

  // ===== Payment Method Selection =====
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleStartPayment("cash")}
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-slate-100 py-5 transition-all duration-200 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/40 transition-transform group-hover:scale-110">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-600 group-hover:text-amber-700">Tunai</span>
        </button>
        <button
          onClick={() => handleStartPayment("qris")}
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-slate-100 py-5 transition-all duration-200 hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-200/40 transition-transform group-hover:scale-110">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-600 group-hover:text-violet-700">QRIS</span>
        </button>
      </div>

      <button
        onClick={onClear}
        className="w-full rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98]"
      >
        Batalkan Transaksi
      </button>
    </div>
  )
}