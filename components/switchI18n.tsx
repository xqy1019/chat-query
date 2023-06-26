import { Dropdown, Menu, Button, Space, Trigger } from '@arco-design/web-react';
import { IconLanguage } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
const DropList = () => {
    const { i18n } = useTranslation();
    return (
        <Menu
            onClickMenuItem={key => i18n.changeLanguage(key)}
            style={{ marginBottom: -4 }}
            mode="popButton"
            tooltipProps={{ position: 'left' }}
            hasCollapseButton
        >
            <Menu.Item key="zh" className="text-[12px]">
                中文
            </Menu.Item>
            <Menu.Item key="en" className="text-[12px]">
                en
            </Menu.Item>
        </Menu>
    );
};

export default function SwitchLang() {
    return (
        <Trigger
            popup={() => <DropList />}
            trigger={['click', 'hover']}
            clickToClose
            position="top"
        >
            <div className={`button-trigger`}>
                <Button type="primary" shape="round" size="small" className="shadow">
                    <IconLanguage />
                </Button>
            </div>
        </Trigger>
    );
}
