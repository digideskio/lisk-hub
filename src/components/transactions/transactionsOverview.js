import React from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
// import grid from 'flexboxgrid/dist/flexboxgrid.css';
import { Link } from 'react-router-dom';
import EmptyState from '../emptyState';
import TransactionsList from './transactionsList';
import styles from './transactions.css';
import txFilters from '../../constants/transactionFilters';
import { getIndexOfFollowedAccount } from '../../utils/followedAccounts';
import { ActionButton } from '../toolbox/buttons/button';
import { FontIcon } from '../fontIcon';
import Ulrs from '../../constants/routes';
import Piwik from '../../utils/piwik';

class TransactionsOverview extends React.Component {
  constructor(props) {
    super(props);
    this.canLoadMore = true;

    this.props.onInit();
  }

  loadMore() {
    Piwik.trackingEvent('TransactionsOverview', 'button', 'Load more');
    if (this.canLoadMore) {
      this.canLoadMore = false;
      this.props.onLoadMore();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  isSmallScreen() {
    return window.innerWidth <= 768;
  }

  componentDidUpdate() {
    this.canLoadMore = this.props.count === null ||
      this.props.count > this.props.transactions.length;
  }

  isActiveFilter(filter) {
    return (!this.props.activeFilter && filter === txFilters.all) ||
      (this.props.activeFilter === filter);
  }

  shouldShowEmptyState() {
    return this.props.transactions.length === 0 && !this.isLoading() &&
      (!this.props.activeFilter || this.props.activeFilter === txFilters.all);
  }

  isLoading() {
    return this.props.loading.length > 0;
  }

  setTransactionsFilter(filter) {
    Piwik.trackingEvent('TransactionsOverview', 'button', 'Set transactions filter');
    this.props.onFilterSet(filter);
  }

  render() { // eslint-disable-line complexity
    const filters = [
      {
        name: this.props.t('All'),
        value: txFilters.all,
        className: 'filter-all',
      },
      {
        name: this.isSmallScreen() ? this.props.t('In') : this.props.t('Incoming'),
        value: txFilters.incoming,
        className: 'filter-in',
      },
      {
        name: this.isSmallScreen() ? this.props.t('Out') : this.props.t('Outgoing'),
        value: txFilters.outgoing,
        className: 'filter-out',
      },
    ];

    if (this.props.delegate && Object.keys(this.props.delegate).length > 0) {
      filters[txFilters.statistics] = {
        name: this.isSmallScreen() ? this.props.t('Stats') : this.props.t('Delegate statistics'),
        value: txFilters.statistics,
        className: 'delegate-statistics',
      };
    } else {
      filters[txFilters.accountInfo] = {
        name: this.isSmallScreen() ? this.props.t('Info') : this.props.t('Account Info'),
        value: txFilters.accountInfo,
        className: 'account-info',
      };
    }

    const index = getIndexOfFollowedAccount(
      this.props.followedAccounts,
      { address: this.props.address },
    );
    const accountTitle = this.props.followedAccounts[index]
      && this.props.followedAccounts[index].title;
    const hasTitle = index !== -1 && accountTitle !== this.props.address;

    return (
      <div className={`transactions ${styles.activity}`}>
        <header>
          <h2 className={`${styles.title}`}>
          {this.props.t('Transaction')}
          {
            hasTitle && (<span>{this.props.t(' of')} <span className={`${styles.accountTitle} account-title`}>{accountTitle}</span></span>)
          }
          </h2>
          {
            this.props.match.url === Ulrs.wallet.path &&
            (
              <div className={`${styles.headerButtons}`}>
                <Link to={`${Ulrs.request.path}`} className={'help-onboarding tx-receive-bt'}>
                  <FontIcon>request-token</FontIcon>
                  {this.props.t('Request')}
                </Link>
                <Link to={`${Ulrs.send.path}?wallet`} className={'tx-send-bt'}>
                  <ActionButton>
                  {this.props.t('Send')}
                  </ActionButton>
                </Link>
              </div>
            )
          }
        </header>
        {this.shouldShowEmptyState() ?
          <EmptyState title={this.props.t('No transactions yet')}
            message={this.props.t('The Wallet will show your recent transactions.')} /> :
          null }
        {this.shouldShowEmptyState() ?
          null :
          <ul className={styles.list}>
            {filters.map((filter, i) => (
              <li key={i} className={`transaction-filter-item ${filter.className} ${styles.item} ${this.isActiveFilter(filter.value) ? styles.active : ''}`}
                onClick={() => this.setTransactionsFilter(filter.value)}>
                {filter.name}
              </li>
            ))}
          </ul>
        }
        {
          <TransactionsList
            filter={filters[this.props.activeFilter]}
            delegate={this.props.delegate}
            votes={this.props.votes}
            voters={this.props.voters}
            votersSize={this.props.votersSize}
            searchMoreVoters={this.props.searchMoreVoters}
            address={this.props.address}
            publicKey={this.props.publicKey}
            transactions={this.props.transactions}
            loadMore={this.loadMore.bind(this)}
            nextStep={this.props.nextStep}
            loading={this.isLoading()}
            t={this.props.t}
            history={this.props.history}
            onClick={props => this.props.onTransactionRowClick(props)}
          />
        }
        {
          // the whole transactions box should be scrollable on XS
          // otherwise only the transaction list should be scrollable
          // (see transactionList.js)
          this.isSmallScreen()
            ? <Waypoint bottomOffset='-80%' key={this.props.transactions.length}
              onEnter={() => { this.loadMore(); }}></Waypoint>
            : null
        }
      </div>
    );
  }
}
const mapStateToProps = state => ({
  followedAccounts: state.followedAccounts.accounts,
  peers: state.peers,
  account: state.account,
});

export default connect(mapStateToProps)(TransactionsOverview);

