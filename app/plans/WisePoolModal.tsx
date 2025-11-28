"use client";

import { useState } from "react";
import { Plan } from "../../lib/domain/models";
import { createPlanAction } from "../servers/planActions";
import { useRole } from "../contexts/RoleContext";

type WisePoolModalProps = {
    onClose: () => void;
    onSave: (plan: Plan) => void;
};

export function WisePoolModal({ onClose, onSave }: WisePoolModalProps) {
    const { user } = useRole();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [planName, setPlanName] = useState("Payroll Plan A");
    const [sendToRecipient, setSendToRecipient] = useState(true);
    const [selectedRecipient, setSelectedRecipient] = useState("1");
    const [sendAmount, setSendAmount] = useState("2500");
    const [receiveAmount, setReceiveAmount] = useState("2845.31");
    const [sendCurrency, setSendCurrency] = useState("GBP");
    const [receiveCurrency, setReceiveCurrency] = useState("EUR");
    const [transactionType, setTransactionType] = useState<"single" | "recurring">("single");
    const [recurringFrequency, setRecurringFrequency] = useState("monthly");
    const [paymentDeadline, setPaymentDeadline] = useState(getDefaultDeadline());
    const [backupPlan, setBackupPlan] = useState("receiver_currency");
    const [paymentMethod, setPaymentMethod] = useState<"direct" | "pool">("pool");

    function getDefaultDeadline() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(15, 0, 0, 0);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
            tomorrow.getDate(),
        )}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    }

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this plan?')) {
            onClose();
        }
    };

    const handleApprove = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Build rule compatible with existing system
            const rule = {
                name: planName,
                need: {
                    currency: receiveCurrency,
                    amount: Number(receiveAmount),
                    convertBy: paymentDeadline,
                },
                netting: {
                    existingBalance: 0,
                    expectedInflows: 0,
                },
                strategy: {
                    mode: "SPREAD_OVER_TIME" as const,
                    chunks: 1,
                },
                sourceCurrency: sendCurrency,
            };

            const { plan } = await createPlanAction(rule, user);
            onSave(plan);
        } catch (e) {
            setError((e as Error).message);
            alert('Plan creation failed: ' + (e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateBackupPlanDescription = () => {
        const descriptions: Record<string, string> = {
            '': 'No backup plan configured',
            'receiver_currency': `If primary payment fails, automatically pay from your ${receiveCurrency} multi-currency account`,
            'gbp_balance': 'If primary payment fails, automatically pay from your GBP balance',
            'usd_balance': 'If primary payment fails, automatically pay from your USD multi-currency account',
            'eur_balance': 'If primary payment fails, automatically pay from your EUR multi-currency account'
        };
        return descriptions[backupPlan] || 'No backup plan configured';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ margin: 0 }}>
            <div style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Avenir Next', Avenir, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                background: "#f7f9fa",
                lineHeight: 1.5,
                minHeight: "100vh",
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    maxWidth: "1400px",
                    margin: "0 auto",
                    minHeight: "100vh",
                }}>
                    {/* Left Side */}
                    <div style={{
                        background: "white",
                        padding: "60px 80px",
                    }}>
                        <h1 style={{
                            fontSize: "48px",
                            fontWeight: 600,
                            color: "#2e4369",
                            marginBottom: "20px",
                            lineHeight: 1.2,
                        }}>Send fast, simple, global payments</h1>
                        <div style={{
                            fontSize: "16px",
                            color: "#6b7c93",
                            marginBottom: "60px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}>
                            Save with our stand out exchange rates. <span style={{
                                width: "16px",
                                height: "16px",
                                border: "1.5px solid #6b7c93",
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 600,
                            }}>i</span>
                        </div>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "40px",
                            marginBottom: "50px",
                        }}>
                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#f7f9fa",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    fontSize: "24px",
                                }}>⚡</div>
                                <div>
                                    <h3 style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                        color: "#2e4369",
                                        marginBottom: "8px",
                                    }}>Instantly pay invoices, suppliers and teams</h3>
                                    <p style={{
                                        fontSize: "15px",
                                        color: "#6b7c93",
                                        lineHeight: 1.6,
                                    }}>Over half of payments arrive in 20 seconds, and 95% take less than 24 hours.*</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#f7f9fa",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    fontSize: "24px",
                                }}>⚡</div>
                                <div>
                                    <h3 style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                        color: "#2e4369",
                                        marginBottom: "8px",
                                    }}>Time saving batch payments</h3>
                                    <p style={{
                                        fontSize: "15px",
                                        color: "#6b7c93",
                                        lineHeight: 1.6,
                                    }}>Simplified bulk transfers that allow you to pay up to 1,000 contacts in one click.</p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#f7f9fa",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    fontSize: "24px",
                                }}>💰</div>
                                <div>
                                    <h3 style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                        color: "#2e4369",
                                        marginBottom: "8px",
                                    }}>Volume discounts on large amounts</h3>
                                    <p style={{
                                        fontSize: "15px",
                                        color: "#6b7c93",
                                        lineHeight: 1.6,
                                    }}>When you send, spend or convert over 20,000 GBP or equivalent in a month, you'll get a volume discount.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: "#e6f7ee",
                            border: "2px solid #00b67a",
                            borderRadius: "12px",
                            padding: "24px",
                            marginTop: "40px",
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "16px",
                            }}>
                                <span style={{
                                    background: "#00b67a",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: "16px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}>NEW</span>
                                <h3 style={{
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    color: "#2e4369",
                                }}>💎 Payment Pool - Better rates together</h3>
                            </div>
                            <div style={{
                                fontSize: "15px",
                                color: "#2e4369",
                                marginBottom: "16px",
                                lineHeight: 1.6,
                            }}>
                                <strong>Join with other businesses and unlock enterprise pricing - even if you&apos;re small.</strong>
                                <p style={{ marginTop: "12px" }}>When you join the daily Payment Pool, your transfer is combined with hundreds of other businesses. Together, you achieve the volume needed for the best rates.</p>
                            </div>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                marginTop: "16px",
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    fontSize: "14px",
                                    color: "#2e4369",
                                }}>
                                    <span style={{ color: "#00b67a", fontWeight: 700, fontSize: "16px" }}>✓</span>
                                    Pay just 0.25% (vs. 0.31% direct) - up to 20% cheaper
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    fontSize: "14px",
                                    color: "#2e4369",
                                }}>
                                    <span style={{ color: "#00b67a", fontWeight: 700, fontSize: "16px" }}>✓</span>
                                    Still arrives same day (by 5 PM local time)
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    fontSize: "14px",
                                    color: "#2e4369",
                                }}>
                                    <span style={{ color: "#00b67a", fontWeight: 700, fontSize: "16px" }}>✓</span>
                                    Perfect for planned payments: payroll, invoices, suppliers
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    fontSize: "14px",
                                    color: "#2e4369",
                                }}>
                                    <span style={{ color: "#00b67a", fontWeight: 700, fontSize: "16px" }}>✓</span>
                                    Help other small businesses save too
                                </div>
                            </div>
                            <div style={{
                                display: "flex",
                                gap: "20px",
                                marginTop: "16px",
                                paddingTop: "16px",
                                borderTop: "1px solid #00b67a33",
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#00b67a",
                                    }}>847</div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7c93",
                                        marginTop: "4px",
                                    }}>Businesses in today&apos;s pool</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#00b67a",
                                    }}>£12.4M</div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7c93",
                                        marginTop: "4px",
                                    }}>Total pool volume</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#00b67a",
                                    }}>3:00 PM</div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7c93",
                                        marginTop: "4px",
                                    }}>Pool closes in 2h 15m</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "40px" }}>
                            <button style={{
                                display: "inline-block",
                                padding: "14px 28px",
                                background: "white",
                                border: "2px solid #2e4369",
                                borderRadius: "4px",
                                color: "#2e4369",
                                fontSize: "15px",
                                fontWeight: 600,
                                textDecoration: "none",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}>Learn about business payments</button>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div style={{
                        background: "#f7f9fa",
                        padding: "40px 60px",
                    }}>
                        <div style={{
                            background: "white",
                            borderRadius: "8px",
                            padding: "32px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}>
                            {error && (
                                <div style={{
                                    marginBottom: "20px",
                                    padding: "12px",
                                    background: "#fee",
                                    border: "1px solid #fcc",
                                    borderRadius: "6px",
                                    color: "#c33",
                                    fontSize: "14px",
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "8px",
                                    display: "block",
                                }}>Plan Name</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="e.g., Monthly Supplier Payment"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #dfe4ea",
                                        borderRadius: "4px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        transition: "border-color 0.2s",
                                    }}
                                />
                            </div>

                            <div style={{
                                marginBottom: "24px",
                                padding: "16px",
                                background: "#f7f9fa",
                                borderRadius: "6px",
                            }}>
                                <label style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    color: "#2e4369",
                                    fontWeight: 500,
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={sendToRecipient}
                                        onChange={(e) => setSendToRecipient(e.target.checked)}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            cursor: "pointer",
                                            accentColor: "#00b67a",
                                        }}
                                    />
                                    <span>Send money to recipient</span>
                                </label>
                                <div style={{ fontSize: "12px", color: "#6b7c93", marginTop: "4px", marginLeft: "24px" }}>
                                    Unchecked = Currency conversion only
                                </div>
                            </div>

                            {sendToRecipient && (
                                <div style={{ marginBottom: "24px" }}>
                                    <label style={{
                                        fontSize: "13px",
                                        color: "#6b7c93",
                                        marginBottom: "8px",
                                        display: "block",
                                    }}>Select Recipient</label>
                                    <select
                                        value={selectedRecipient}
                                        onChange={(e) => setSelectedRecipient(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            border: "1px solid #dfe4ea",
                                            borderRadius: "4px",
                                            fontSize: "15px",
                                            fontFamily: "inherit",
                                            background: "white",
                                            cursor: "pointer",
                                            transition: "border-color 0.2s",
                                        }}
                                    >
                                        <option value="">Choose recipient...</option>
                                        <option value="1">Tech Supplies Ltd - EUR Account</option>
                                        <option value="2">Marketing Agency GmbH</option>
                                        <option value="3">Freelancer - Jan Kowalski</option>
                                        <option value="4">Office Rent - Berlin</option>
                                    </select>
                                </div>
                            )}

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                color: "#6b7c93",
                                marginBottom: "20px",
                            }}>
                                🔒 Rate guaranteed (24h)
                            </div>
                            <div style={{
                                textAlign: "center",
                                fontSize: "14px",
                                color: "#6b7c93",
                                marginBottom: "24px",
                                padding: "12px",
                                background: "#f7f9fa",
                                borderRadius: "6px",
                            }}>
                                1 GBP = 1.1417 EUR
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "8px",
                                    display: "block",
                                }}>You send exactly</label>
                                <div style={{
                                    width: "100%",
                                    padding: "16px",
                                    border: "1px solid #dfe4ea",
                                    borderRadius: "4px",
                                    fontSize: "20px",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    <input
                                        type="number"
                                        value={sendAmount}
                                        onChange={(e) => setSendAmount(e.target.value)}
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            fontSize: "20px",
                                            fontWeight: 500,
                                            width: "50%",
                                        }}
                                    />
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontSize: "16px",
                                    }}>
                                        🇬🇧 <strong>{sendCurrency}</strong> <span style={{ color: "#9ca8b4" }}>▼</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "8px",
                                    display: "block",
                                }}>Recipient gets</label>
                                <div style={{
                                    width: "100%",
                                    padding: "16px",
                                    border: "1px solid #dfe4ea",
                                    borderRadius: "4px",
                                    fontSize: "20px",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    <span>{receiveAmount}</span>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontSize: "16px",
                                    }}>
                                        🇪🇺 <strong>{receiveCurrency}</strong> <span style={{ color: "#9ca8b4" }}>▼</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "8px",
                                    display: "block",
                                }}>Transaction Type</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => setTransactionType("single")}
                                        style={{
                                            flex: 1,
                                            padding: "10px 16px",
                                            border: `2px solid ${transactionType === "single" ? "#00b67a" : "#dfe4ea"}`,
                                            background: transactionType === "single" ? "#e6f7ee" : "white",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: transactionType === "single" ? "#00b67a" : "#6b7c93",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        Single Payment
                                    </button>
                                    <button
                                        onClick={() => setTransactionType("recurring")}
                                        style={{
                                            flex: 1,
                                            padding: "10px 16px",
                                            border: `2px solid ${transactionType === "recurring" ? "#00b67a" : "#dfe4ea"}`,
                                            background: transactionType === "recurring" ? "#e6f7ee" : "white",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: transactionType === "recurring" ? "#00b67a" : "#6b7c93",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        Recurring
                                    </button>
                                </div>
                                {transactionType === "recurring" && (
                                    <div style={{ marginTop: "12px" }}>
                                        <select
                                            value={recurringFrequency}
                                            onChange={(e) => setRecurringFrequency(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "12px 16px",
                                                border: "1px solid #dfe4ea",
                                                borderRadius: "4px",
                                                fontSize: "15px",
                                                fontFamily: "inherit",
                                                background: "white",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Every 2 weeks</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    </div>
                                )}

                                <div style={{ marginTop: "16px" }}>
                                    <label style={{
                                        fontSize: "13px",
                                        color: "#6b7c93",
                                        marginBottom: "8px",
                                        display: "block",
                                    }}>Payment Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={paymentDeadline}
                                        onChange={(e) => setPaymentDeadline(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            border: "1px solid #dfe4ea",
                                            borderRadius: "4px",
                                            fontSize: "15px",
                                            fontFamily: "inherit",
                                        }}
                                    />
                                    <div style={{ fontSize: "12px", color: "#6b7c93", marginTop: "6px" }}>
                                        Payment will be executed before this time
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <div style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "12px",
                                }}>Paying with</div>

                                <div
                                    onClick={() => setPaymentMethod("direct")}
                                    style={{
                                        border: `2px solid ${paymentMethod === "direct" ? "#00b67a" : "#dfe4ea"}`,
                                        borderRadius: "4px",
                                        padding: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "20px",
                                            height: "20px",
                                            border: `2px solid ${paymentMethod === "direct" ? "#00b67a" : "#dfe4ea"}`,
                                            borderRadius: "50%",
                                            position: "relative",
                                            flexShrink: 0,
                                        }}>
                                            {paymentMethod === "direct" && (
                                                <div style={{
                                                    width: "10px",
                                                    height: "10px",
                                                    background: "#00b67a",
                                                    borderRadius: "50%",
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                }} />
                                            )}
                                        </div>
                                        <div style={{ fontSize: "20px" }}>🏦</div>
                                        <div style={{
                                            fontSize: "15px",
                                            color: "#2e4369",
                                            fontWeight: 500,
                                        }}>Bank transfer (Direct)</div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod("pool")}
                                    style={{
                                        border: "2px solid #00b67a",
                                        background: "#f0fdf6",
                                        position: "relative",
                                        borderRadius: "4px",
                                        padding: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "-12px",
                                        left: "16px",
                                        background: "#00b67a",
                                        color: "white",
                                        padding: "4px 12px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        letterSpacing: "0.5px",
                                    }}>SAVE 20%</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "20px",
                                            height: "20px",
                                            border: `2px solid ${paymentMethod === "pool" ? "#00b67a" : "#dfe4ea"}`,
                                            borderRadius: "50%",
                                            position: "relative",
                                            flexShrink: 0,
                                        }}>
                                            {paymentMethod === "pool" && (
                                                <div style={{
                                                    width: "10px",
                                                    height: "10px",
                                                    background: "#00b67a",
                                                    borderRadius: "50%",
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                }} />
                                            )}
                                        </div>
                                        <div style={{ fontSize: "20px" }}>💎</div>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px",
                                        }}>
                                            <div style={{
                                                fontSize: "15px",
                                                color: "#2e4369",
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}>
                                                Payment Pool
                                                <span style={{
                                                    background: "#00b67a",
                                                    color: "white",
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                }}>RECOMMENDED</span>
                                            </div>
                                            <div style={{
                                                fontSize: "13px",
                                                color: "#00b67a",
                                                fontWeight: 500,
                                            }}>Arrives today by 5 PM • Save £1.50</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                borderTop: "1px solid #dfe4ea",
                                paddingTop: "20px",
                                marginTop: "20px",
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "12px",
                                    fontSize: "14px",
                                }}>
                                    <span style={{ color: "#6b7c93" }}>Bank transfer fee</span>
                                    <span style={{ color: "#2e4369", fontWeight: 500 }}>0 GBP</span>
                                </div>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "12px",
                                    fontSize: "14px",
                                }}>
                                    <span style={{ color: "#6b7c93" }}>Our fee (0.31% standard)</span>
                                    <span style={{ color: "#2e4369", fontWeight: 500 }}>7.75 GBP</span>
                                </div>

                                {paymentMethod === "pool" && (
                                    <div style={{
                                        background: "#dcfce7",
                                        border: "1px solid #00b67a",
                                        borderRadius: "4px",
                                        padding: "8px 12px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "12px",
                                        fontSize: "14px",
                                    }}>
                                        <span style={{ color: "#00b67a", fontWeight: 500 }}>💎 Pool discount (0.25% rate)</span>
                                        <span style={{ color: "#00b67a", fontWeight: 600 }}>-1.50 GBP →</span>
                                    </div>
                                )}

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    paddingTop: "12px",
                                    borderTop: "1px solid #dfe4ea",
                                }}>
                                    <span style={{ color: "#6b7c93" }}>Total included fees ({paymentMethod === "pool" ? "0.25%" : "0.31%"})</span>
                                    <span style={{ color: "#2e4369" }}>{paymentMethod === "pool" ? "6.25" : "7.75"} GBP</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: "20px",
                                padding: "16px",
                                background: "#f7f9fa",
                                borderRadius: "6px",
                                fontSize: "14px",
                                color: "#6b7c93",
                            }}>
                                Should arrive <strong style={{ color: "#2e4369" }}>today by 5:00 PM CET</strong>
                                <div style={{ marginTop: "8px", fontSize: "13px" }}>
                                    Pool closes at 3:00 PM (2h 15m remaining) • 847 businesses already joined
                                </div>
                            </div>

                            {paymentMethod === "pool" && (
                                <div style={{
                                    marginTop: "20px",
                                    padding: "20px",
                                    background: "linear-gradient(135deg, #e6f7ee 0%, #dcfce7 100%)",
                                    borderRadius: "8px",
                                    display: "flex",
                                    gap: "16px",
                                }}>
                                    <div style={{
                                        fontSize: "32px",
                                        flexShrink: 0,
                                    }}>🎉</div>
                                    <div>
                                        <h4 style={{
                                            fontSize: "15px",
                                            color: "#2e4369",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                        }}>You&apos;re using Payment Pool - smarter pricing!</h4>
                                        <p style={{
                                            fontSize: "13px",
                                            color: "#6b7c93",
                                            marginBottom: "12px",
                                        }}>By joining with 847 other businesses, you&apos;ve unlocked a 0.25% rate and saved £1.50 on this transfer.</p>
                                        <a href="#" style={{
                                            color: "#00b67a",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                            borderBottom: "1px solid #00b67a",
                                        }}>Learn how Payment Pool works →</a>
                                    </div>
                                </div>
                            )}

                            <div style={{
                                marginTop: "24px",
                                paddingTop: "24px",
                                borderTop: "2px solid #dfe4ea",
                            }}>
                                <label style={{
                                    fontSize: "13px",
                                    color: "#6b7c93",
                                    marginBottom: "8px",
                                    display: "block",
                                }}>Backup Plan</label>
                                <select
                                    value={backupPlan}
                                    onChange={(e) => setBackupPlan(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid #dfe4ea",
                                        borderRadius: "4px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="">None - No backup</option>
                                    <option value="receiver_currency">Use Receiver&apos;s Currency Balance</option>
                                    <option value="gbp_balance">Use GBP Balance</option>
                                    <option value="usd_balance">Use USD Balance</option>
                                    <option value="eur_balance">Use EUR Balance (Multi-currency Account)</option>
                                </select>
                                <div style={{ fontSize: "12px", color: "#6b7c93", marginTop: "6px" }}>
                                    {updateBackupPlanDescription()}
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "24px",
                            }}>
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: "16px 24px",
                                        border: "2px solid #dfe4ea",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        background: "#f7f9fa",
                                        color: "#6b7c93",
                                        opacity: isLoading ? 0.5 : 1,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: "16px 24px",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        background: "#00b67a",
                                        color: "white",
                                        opacity: isLoading ? 0.5 : 1,
                                    }}
                                >
                                    {isLoading ? "Creating plan..." : "Approve Plan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
