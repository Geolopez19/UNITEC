import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RutaPersonalizadaCard } from '../components/dashboard/RutaPersonalizadaCard';
import { ResumenVentasCard } from '../components/dashboard/ResumenVentasCard';
import { ProximosImpuestosCard } from '../components/dashboard/ProximosImpuestosCard';
import { CapacitacionLeanCard } from '../components/dashboard/CapacitacionLeanCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [totalSales, setTotalSales] = useState<number>(12450);
  const [taxDays] = useState<number>(3);
  const [recommendedLesson, setRecommendedLesson] = useState<{ title: string; video_url: string } | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (profile?.id) {
          const { data: invoicesData } = await supabase
            .from('invoices')
            .select('total_amount')
            .eq('user_id', profile.id)
            .eq('status', 'issued');

          if (invoicesData && Array.isArray(invoicesData) && invoicesData.length > 0) {
            const sum = (invoicesData as { total_amount: number }[]).reduce(
              (acc, curr) => acc + (Number(curr.total_amount) || 0),
              0
            );
            if (sum > 0) setTotalSales(sum);
          }

          const { data: lessonData } = await supabase
            .from('lean_lessons')
            .select('title, video_url')
            .lte('level_required', profile.current_level || 1)
            .limit(1)
            .maybeSingle();

          if (lessonData) {
            setRecommendedLesson(lessonData);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    loadDashboardData();
  }, [profile]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-8">
        <h3 className="font-headline text-3xl font-bold text-on-surface mb-2">
          Bienvenido de nuevo
        </h3>
        <p className="text-base text-on-surface-variant">
          Aquí está el resumen de tu negocio hoy.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <RutaPersonalizadaCard currentLevel={profile?.current_level || 2} />
        <ResumenVentasCard totalSales={totalSales} percentageGrowth={15} />
        <ProximosImpuestosCard
          taxType="Declaración mensual de IVA"
          daysRemaining={taxDays}
          dueDateLabel="15 de Mes"
        />
        <CapacitacionLeanCard
          title={recommendedLesson?.title || 'Capacitación Lean Recomendada'}
          description="Aprende a optimizar tus procesos y reducir costos con esta metodología ágil de 15 minutos."
        />
      </div>
    </DashboardLayout>
  );
};
