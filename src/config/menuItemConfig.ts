import { ChatIcon } from "@/components/SvgComponents";
import { 
  HomeIcon, 
  UserIcon, 
  MessageSquareIcon,
  SendIcon,
  AlertTriangleIcon,
  GiftIcon, 
  SettingsIcon, 
  ShieldIcon,
  BellIcon,
  CrownIcon,
  MapPinIcon,
  CoinsIcon,
  ChartBarIcon,
  CreditCardIcon,
  TrendingUpIcon,
  BarChart3Icon,
  PieChartIcon,
  DollarSignIcon,
  ActivityIcon
} from "lucide-react";

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: HomeIcon,
    path: "/panel"
  },
  {
    id: "users",
    title: "Kullanıcı Yönetimi",
    icon: UserIcon,
    path: "/panel/users",
    children: [
      {
        id: "users-list",
        title: "Kullanıcı Listesi",
        icon: UserIcon,
        path: "/panel/users"
      },
      {
        id: "users-fake",
        title: "Sahte Profiller",
        icon: ShieldIcon,
        path: "/panel/users/fake"
      },
    ]
  },
  {
    id: "messages",
    title: "Mesaj Yönetimi",
    icon: MessageSquareIcon,
    path: "/panel/messages",
    children: [
      {
        id: "messages-list",
        title: "Mesaj Listesi",
        icon: MessageSquareIcon,
        path: "/panel/messages"
      },
      {
        id: "messages-send",
        title: "Mesaj Gönder",
        icon: SendIcon,
        path: "/panel/messages/send"
      },
      {
        id: "messages-reports",
        title: "Şikayet Edilen Mesajlar",
        icon: AlertTriangleIcon,
        path: "/panel/messages/reports"
      }
    ]
  },
  {
    id: "premium",
    title: "Premium Yönetimi",
    icon: CrownIcon,
    path: "/panel/premium",
    children: [
      {
        id: "premium-packages",
        title: "Premium Paketler",
        icon: CrownIcon,
        path: "/panel/premium"
      },
      {
        id: "premium-subscriptions",
        title: "Abonelikler",
        icon: CreditCardIcon,
        path: "/panel/premium/subscriptions"
      }
    ]
  },
  {
    id: "coins",
    title: "Coin Yönetimi",
    icon: CoinsIcon,
    path: "/panel/coins",
    children: [
      {
        id: "coin-packages",
        title: "Coin Paketleri",
        icon: CoinsIcon,
        path: "/panel/coins"
      },
      {
        id: "coin-transactions",
        title: "Coin İşlemleri",
        icon: TrendingUpIcon,
        path: "/panel/coins/transactions"
      },
      {
        id: "coin-prices",
        title: "Coin Fiyatları",
        icon: DollarSignIcon,
        path: "/panel/coins/prices"
      }
    ]
  },
  {
    id: "gifts",
    title: "Hediye Yönetimi",
    icon: GiftIcon,
    path: "/panel/gifts",
    children: [
      {
        id: "gifts-list",
        title: "Hediye Listesi",
        icon: GiftIcon,
        path: "/panel/gifts"
      },
      {
        id: "gifts-transactions",
        title: "Hediye İşlemleri",
        icon: BarChart3Icon,
        path: "/panel/gifts/transactions"
      }
    ]
  },
  {
    id: "locations",
    title: "Şehir Yönetimi",
    icon: MapPinIcon,
    path: "/panel/locations"
  },
  {
    id: "notifications",
    title: "Bildirim Yönetimi",
    icon: BellIcon,
    path: "/panel/notifications",
    children: [
      {
        id: "notifications-send",
        title: "Bildirim Gönder",
        icon: SendIcon,
        path: "/panel/notifications/send"
      },
      {
        id: "notifications-history",
        title: "Bildirim Geçmişi",
        icon: ActivityIcon,
        path: "/panel/notifications/history"
      }
    ]
  },
  {
    id: "analytics",
    title: "Analitik & Raporlar",
    icon: ChartBarIcon,
    path: "/panel/analytics",
    children: [
      {
        id: "analytics-overview",
        title: "Genel Bakış",
        icon: PieChartIcon,
        path: "/panel/analytics"
      },
      {
        id: "analytics-users",
        title: "Kullanıcı Analitikleri",
        icon: UserIcon,
        path: "/panel/analytics/users"
      },
      {
        id: "analytics-revenue",
        title: "Gelir Analitikleri",
        icon: DollarSignIcon,
        path: "/panel/analytics/revenue"
      },
      {
        id: "analytics-activity",
        title: "Aktivite Logları",
        icon: ActivityIcon,
        path: "/panel/analytics/activity"
      }
    ]
  },
  {
    id: "settings",
    title: "Sistem Ayarları",
    icon: SettingsIcon,
    path: "/panel/settings",
    children: [
      {
        id: "settings-app",
        title: "Uygulama Ayarları",
        icon: SettingsIcon,
        path: "/panel/settings/app"
      },
      {
        id: "settings-admin",
        title: "Admin Yönetimi",
        icon: ShieldIcon,
        path: "/panel/settings/admin"
      }
    ]
  }
];