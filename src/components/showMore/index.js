import React from 'react';
import styles from './showMore.css';

const ShowMore = props => (
  <div
    className={`${styles.wrapper} ${props.className} show-more-button`}
    onClick={props.onClick}
  >
    <span>{props.text}</span>
  </div>
);

export default ShowMore;
