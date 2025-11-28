import React from 'react';
import './Home.css';
import { SvgIcon } from './components/SvgIcon';

export default function Home() {
  return (
    <div className="home-container">
      {/* Total Balance */}
      <div className="balance-section">
        <h2 className="balance-title">Total balance</h2>
        <div className="balance-row">
          <p className="balance-amount">35,531.22 GBP</p>
          <SvgIcon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="info-icon" />
        </div>
        <div className="balance-buttons">
          <button className="btn-send">Send</button>
          <button className="btn-gray">Add money</button>
          <button className="btn-gray btn-icon">Get paid <SvgIcon path="M19 9l-7 7-7-7" className="chevron-icon" /></button>
        </div>
      </div>

      {/* Main Accounts & Payroll Cards */}
      <div className="grid-section">
        {/* Main Account */}
        <div className="card main-account">
          <h3 className="card-title">Main Accounts</h3>

          <div className="account-row">
            <div className="account-left">
              <div className="flag flag-uk">UK</div>
              <div>British Pound (GBP)</div>
            </div>
            <p className="amount">23,152.00 GBP</p>
          </div>

          <div className="account-row">
            <div className="account-left">
              <div className="flag flag-us">US</div>
              <div>US Dollar (USD)</div>
            </div>
            <p className="amount">5,239.00 USD</p>
          </div>

          <div className="account-row no-border">
            <div className="account-left">
              <div className="flag flag-au">AU</div>
              <div>Australian Dollar (AUD)</div>
            </div>
            <p className="amount">1,200.00 AUD</p>
          </div>

          <button className="link-btn">Account details</button>
        </div>

        {/* Payroll */}
        <div className="card payroll-card">
          <h3 className="card-title">Payroll</h3>
          <div className="payroll-row">
            <div className="flag flag-uk">UK</div>
            <div>British Pound</div>
          </div>
          <button className="btn-gray small">Set up payroll</button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="card transactions-card">
        <div className="transactions-header">
          <h3 className="transactions-title">Transactions</h3>
          <a href="#" className="see-all">See all</a>
        </div>

        <div className="transaction-row">
          <div className="transaction-left">
            <div className="icon-circle">
              <SvgIcon path="M8 7l4-4m0 0l4 4m-4-4v16" className="transaction-icon" />
            </div>
            <div>
              <p className="transaction-title">Vendor Design</p>
              <p className="transaction-sub">By Jimmy - Sending</p>
            </div>
          </div>
          <p className="amount">250.21 GBP</p>
        </div>

        <div className="transaction-row">
          <div className="transaction-left">
            <div className="icon-circle">
              <SvgIcon path="M16 17l-4 4m0 0l-4-4m4 4V3" className="transaction-icon" />
            </div>
            <div>
              <p className="transaction-title">Alex Main</p>
              <p className="transaction-sub">Received</p>
            </div>
          </div>
          <p className="amount">8,000.00 GBP</p>
        </div>

        <div className="transaction-row no-border">
          <div className="transaction-left">
            <div className="icon-circle">
              <SvgIcon path="M8 7l4-4m0 0l4 4m-4-4v16" className="transaction-icon" />
            </div>
            <div>
              <p className="transaction-title">Software Subscription</p>
              <p className="transaction-sub">USD Account - Debit</p>
            </div>
          </div>
          <p className="amount">59.99 USD</p>
        </div>
      </div>
    </div>
  );
}
