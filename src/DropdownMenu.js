import classNames from 'classnames';
import keycode from 'keycode';
import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

import { bsClass, getClassSet, prefix, splitBsProps }
  from './utils/bootstrapUtils';
import createChainedFunction from './utils/createChainedFunction';
import ValidComponentChildren from './utils/ValidComponentChildren';
import { SIZE_MAP, Size } from './utils/StyleConfig';

const propTypes = {
  open: React.PropTypes.bool,
  pullRight: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  labelledBy: React.PropTypes.oneOfType([
    React.PropTypes.string, React.PropTypes.number,
  ]),
  onSelect: React.PropTypes.func,
  rootCloseEvent: React.PropTypes.oneOf(['click', 'mousedown']),
  bsSize: React.PropTypes.string,
};

const defaultProps = {
  bsRole: 'menu',
  pullRight: false,
};

class DropdownMenu extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case keycode.codes.down:
        this.focusNext();
        event.preventDefault();
        break;
      case keycode.codes.up:
        this.focusPrevious();
        event.preventDefault();
        break;
      case keycode.codes.esc:
      case keycode.codes.tab:
        this.props.onClose(event);
        break;
      default:
    }
  }

  getItemsAndActiveIndex() {
    const items = this.getFocusableMenuItems();
    const activeIndex = items.indexOf(document.activeElement);

    return { items, activeIndex };
  }

  getFocusableMenuItems() {
    const node = ReactDOM.findDOMNode(this);
    if (!node) {
      return [];
    }

    return Array.from(node.querySelectorAll('[tabIndex="-1"]'));
  }

  focusNext() {
    const { items, activeIndex } = this.getItemsAndActiveIndex();
    if (items.length === 0) {
      return;
    }

    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    items[nextIndex].focus();
  }

  focusPrevious() {
    const { items, activeIndex } = this.getItemsAndActiveIndex();
    if (items.length === 0) {
      return;
    }

    const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    items[prevIndex].focus();
  }

  render() {
    const {
      open,
      pullRight,
      onClose,
      labelledBy,
      onSelect,
      className,
      bsSize,
      rootCloseEvent,
      children,
      ...props
    } = this.props;

    const [bsProps, elementProps] = splitBsProps(props);

    const classes = {
      ...getClassSet(bsProps),
      [prefix(bsProps, 'right')]: pullRight,
    };

    // If user provides a size, make sure to append it to classes as input-
    // e.g. if bsSize is small, it will append input-sm
    if (bsSize) {
      const size = SIZE_MAP[bsSize] || bsSize;
      classes[prefix({ bsClass: 'dropdown' }, size)] = true;
    }

    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={onClose}
        event={rootCloseEvent}
      >
        <ul
          {...elementProps}
          role="menu"
          className={classNames(className, classes)}
          aria-labelledby={labelledBy}
        >
          {ValidComponentChildren.map(children, child => (
            React.cloneElement(child, {
              onKeyDown: createChainedFunction(
                child.props.onKeyDown, this.handleKeyDown
              ),
              onSelect: createChainedFunction(child.props.onSelect, onSelect),
            })
          ))}
        </ul>
      </RootCloseWrapper>
    );
  }
}

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

export default bsClass('dropdown-menu', DropdownMenu);
