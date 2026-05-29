import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin, Database } from 'lucide-react';

interface DashboardProps {
  totalCustomers: number;
  totalEvents: number;
  totalLocations: number;
  totalDataEntries: number;
}

export default function Dashboard({ totalCustomers, totalEvents, totalLocations, totalDataEntries }: DashboardProps) {
  const cardData = [
    // {
    //   title: 'مشتریان',
    //   count: totalCustomers,
    //   icon: <Users className="h-5 w-5 text-blue-600" />,
    //   link: '/customers',
    // },
    {
      title: 'رویدادها',
      count: totalEvents,
      icon: <Calendar className="h-5 w-5 text-green-600" />,
      link: '/event',
    },
    {
      title: 'موقعیت‌ها',
      count: totalLocations,
      icon: <MapPin className="h-5 w-5 text-purple-600" />,
      link: '/location',
    },
    // {
    //   title: 'ورودی‌های اطلاعات',
    //   count: totalDataEntries,
    //   icon: <Database className="h-5 w-5 text-orange-600" />,
    //   link: '/data',
    // },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">داشبورد مدیریت</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map((card) => (
            <Card
              key={card.title}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.count}</div>

                <Link href={card.link}>
                  <Button className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    مشاهده {card.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
