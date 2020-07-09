import {RouteComponentProps} from 'react-router/lib/Router';
import {browserHistory} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import space from 'app/styles/space';
import Button from 'app/components/button';
import {slideInLeft, fadeIn} from 'app/styles/animations';
import {IconClose, IconMenu} from 'app/icons';

import SettingsBreadcrumb from './settingsBreadcrumb';
import SettingsHeader from './settingsHeader';
import SettingsSearch from './settingsSearch';

type Props = {
  renderNavigation?: () => React.ReactNode;
  children: React.ReactNode;
} & RouteComponentProps<{}, {}>;

type State = {
  navVisible: boolean;
  navOffsetTop: number;
};

class SettingsLayout extends React.Component<Props, State> {
  static propTypes = {
    renderNavigation: PropTypes.func,
    route: PropTypes.object,
    router: PropTypes.object,
    routes: PropTypes.array,
  };

  constructor(props: Props) {
    super(props);

    this.headerRef = React.createRef();

    // Close the navigation when navigating.
    this.unlisten = browserHistory.listen(() => this.toggleNav(false));
  }

  state = {
    /**
     * This is used when the screen is small enough that the navigation should
     * be hidden. On large screens this state will end up unused.
     */
    navVisible: false,
    /**
     * Offset mobile settings navigation by the height of main navigation,
     * settings breadcrumbs and optional warnings.
     */
    navOffsetTop: 0,
  };

  componentWillUnmount() {
    this.unlisten();
  }

  unlisten: () => void;
  headerRef: React.RefObject<HTMLDivElement>;

  toggleNav(navVisible: boolean) {
    // when the navigation is opened, body should be scroll-locked
    this.toggleBodyScrollLock(navVisible);

    this.setState({
      navOffsetTop: this.headerRef.current?.getBoundingClientRect().bottom ?? 0,
      navVisible,
    });
  }

  toggleBodyScrollLock(lock: boolean) {
    const bodyElement = document.getElementsByTagName('body')[0];
    window.scrollTo(0, 0);
    bodyElement.style.overflow = lock ? 'hidden' : 'visible';
    bodyElement.style.position = lock ? 'fixed' : 'static';
    bodyElement.style.width = lock ? '100%' : 'auto';
  }

  render() {
    const {params, routes, route, router, renderNavigation, children} = this.props;
    const {navVisible, navOffsetTop} = this.state;

    // We want child's view's props
    const childProps =
      children && React.isValidElement(children) ? children.props : this.props;
    const childRoutes = childProps.routes || routes || [];
    const childRoute = childProps.route || route || {};
    const shouldRenderNavigation = typeof renderNavigation === 'function';

    return (
      <SettingsColumn>
        <SettingsHeader ref={this.headerRef}>
          <HeaderContent>
            {shouldRenderNavigation && (
              <NavMenuToggle
                priority="link"
                icon={navVisible ? <IconClose /> : <IconMenu />}
                onClick={() => this.toggleNav(!navVisible)}
              />
            )}
            <StyledSettingsBreadcrumb
              params={params}
              routes={childRoutes}
              route={childRoute}
            />
            <SettingsSearch routes={routes} router={router} params={params} />
          </HeaderContent>
        </SettingsHeader>

        <MaxWidthContainer>
          {shouldRenderNavigation && (
            <SidebarWrapper isVisible={navVisible} offsetTop={navOffsetTop}>
              {renderNavigation!()}
            </SidebarWrapper>
          )}
          <NavMask isVisible={navVisible} onClick={() => this.toggleNav(false)} />
          <Content>{children}</Content>
        </MaxWidthContainer>
      </SettingsColumn>
    );
  }
}

const SettingsColumn = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1; /* so this stretches vertically so that footer is fixed at bottom */
  min-width: 0; /* fixes problem when child content stretches beyond layout width */
  footer {
    margin-top: 0;
  }
`;

const HeaderContent = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavMenuToggle = styled(Button)`
  display: none;
  margin-right: ${space(2)};
  color: ${p => p.theme.gray600};
  &:hover,
  &:focus,
  &:active {
    color: ${p => p.theme.gray800};
  }
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: block;
  }
`;

const StyledSettingsBreadcrumb = styled(SettingsBreadcrumb)`
  flex: 1;
`;

const MaxWidthContainer = styled('div')`
  display: flex;
  max-width: ${p => p.theme.settings.containerWidth};
  flex: 1;
`;

const SidebarWrapper = styled('div')<{isVisible: boolean; offsetTop: number}>`
  flex-shrink: 0;
  width: ${p => p.theme.settings.sidebarWidth};
  background: ${p => p.theme.white};
  border-right: 1px solid ${p => p.theme.borderLight};
  padding: ${space(4)};
  padding-right: ${space(2)};

  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: ${p => (p.isVisible ? 'block' : 'none')};
    position: fixed;
    top: ${p => p.offsetTop}px;
    bottom: 0;
    overflow-y: auto;
    animation: ${slideInLeft} 100ms ease-in-out;
    z-index: ${p => p.theme.zIndex.settingsSidebarNav};
    box-shadow: ${p => p.theme.dropShadowHeavy};
  }
`;

const NavMask = styled('div')<{isVisible: boolean}>`
  display: none;
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: ${p => (p.isVisible ? 'block' : 'none')};
    background: rgba(0, 0, 0, 0.35);
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: ${p => p.theme.zIndex.settingsSidebarNavMask};
    animation: ${fadeIn} 250ms ease-in-out;
  }
`;

/**
 * Note: `overflow: hidden` will cause some buttons in `SettingsPageHeader` to be cut off because it has negative margin.
 * Will also cut off tooltips.
 */
const Content = styled('div')`
  flex: 1;
  padding: ${space(4)};
  min-width: 0; /* keep children from stretching container */
`;

export default SettingsLayout;
