"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
]

export default function CryptoPage() {
  const [amount, setAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOS[0])
  const [result, setResult] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [chartData, setChartData] = useState<{ day: string; price: number }[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  async function fetchLivePrices() {
    try {
      const results = await Promise.all(
        CRYPTOS.map(c =>
          fetch(`https://min-api.cryptocompare.com/data/price?fsym=${c.symbol}&tsyms=USD`)
            .then(r => r.json())
            .then(d => ({ symbol: c.symbol, price: d.USD }))
        )
      )
      const priceMap: Record<string, number> = {}
      results.forEach(r => { priceMap[r.symbol] = r.price })
      setLivePrices(priceMap)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Error fetching prices:", error)
    }
  }

  async function fetchChartData(symbol: string) {
    setChartLoading(true)
    try {
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=7`
      )
      const data = await res.json()
      const formatted = data.Data.Data.map((d: { time: number; close: number }) => ({
        day: new Date(d.time * 1000).toLocaleDateString("es-AR", { weekday: "short", day: "numeric" }),
        price: d.close,
      }))
      setChartData(formatted)
    } catch (error) {
      console.error("Error fetching chart:", error)
    } finally {
      setChartLoading(false)
    }
  }

  useEffect(() => {
    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchChartData(selectedCrypto.symbol)
  }, [selectedCrypto])

  useEffect(() => {
    if (!amount || isNaN(Number(amount))) return
    const cryptoPrice = livePrices[selectedCrypto.symbol]
    if (!cryptoPrice) return
    setPrice(cryptoPrice)
    setResult(Number(amount) / cryptoPrice)
  }, [selectedCrypto, livePrices])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">Crypto</h1>
        <p className="text-gray-400 mb-8">Convertí USD a crypto en tiempo real</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Conversor */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Conversor</h2>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Monto en USD</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => {
  if (e.key === "Enter" && amount && !isNaN(Number(amount))) {
    const cryptoPrice = livePrices[selectedCrypto.symbol]
    if (cryptoPrice) {
      setPrice(cryptoPrice)
      setResult(Number(amount) / cryptoPrice)
    }
  }
}}
                placeholder="100"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-xl"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Crypto</label>
              <div className="flex gap-2 flex-wrap">
                {CRYPTOS.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => { setSelectedCrypto(crypto); setResult(null); setPrice(null); }}
                    className={`px-4 py-2 rounded-xl border transition font-medium ${
                      selectedCrypto.id === crypto.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {crypto.symbol}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!amount || isNaN(Number(amount))) return
                setLoading(true)
                const cryptoPrice = livePrices[selectedCrypto.symbol]
                if (cryptoPrice) {
                  setPrice(cryptoPrice)
                  setResult(Number(amount) / cryptoPrice)
                }
                setLoading(false)
              }}
              disabled={loading || Object.keys(livePrices).length === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-xl font-medium transition"
            >
              {loading ? "Calculando..." : "Convertir"}
            </button>

            {result !== null && price !== null && (
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  1 {selectedCrypto.symbol} = ${price.toLocaleString()} USD
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {result.toFixed(8)} {selectedCrypto.symbol}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  por ${Number(amount).toLocaleString()} USD
                </p>
              </div>
            )}
          </div>

          {/* Precios en vivo */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Precios en vivo</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-gray-500 text-xs">{lastUpdated || "Cargando..."}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {CRYPTOS.map((crypto) => (
                <div
                  key={crypto.id}
                  onClick={() => { setSelectedCrypto(crypto); setResult(null); setPrice(null); }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    selectedCrypto.id === crypto.id
                      ? "bg-blue-900 border border-blue-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                      {crypto.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{crypto.name}</p>
                      <p className="text-gray-500 text-xs">{crypto.symbol}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">
                    {livePrices[crypto.symbol]
                      ? `$${livePrices[crypto.symbol].toLocaleString()}`
                      : "..."}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-xs mt-4 text-center">
              Se actualiza cada 30 segundos
            </p>
          </div>

        </div>

        {/* Gráfico */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-1">
            {selectedCrypto.name} — últimos 7 días
          </h2>
          <p className="text-gray-500 text-sm mb-6">Precio de cierre en USD</p>

          {chartLoading ? (
            <div className="h-48 flex items-center justify-center text-gray-500">
              Cargando gráfico...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} width={80}/>
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px" }}
                  labelStyle={{ color: "#9ca3af" }}
                  formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, selectedCrypto.symbol]}
                />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPrice)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </main>
  )
}