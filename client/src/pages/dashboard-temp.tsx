import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import type { Account, Trade } from "@shared/schema";
import WeeklyPerformanceCalendar from "@/components/weekly-performance-calendar";

export default function Dashboard() {
  const { data: accounts } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const { data: trades } = useQuery<Trade[]>({ queryKey: ["/api/trades"] });

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="p-8">
        {/* Weekly Performance Calendar - Enhanced with Navigation */}
        <div className="mb-8">
          <WeeklyPerformanceCalendar trades={trades} />
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gradient-rainbow">Weekly Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'calendar' ? 'chart' : 'calendar')}
                    className="border-gold text-gold hover:bg-gold/10"
                  >
                    {viewMode === 'calendar' ? <BarChart3 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                  className="border-gold text-gold hover:bg-gold/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <h3 className="text-white font-semibold">
                    {(() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - dayOfWeek + (currentWeekOffset * 7));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                    })()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Week {currentWeekOffset === 0 ? '(Current)' : `${Math.abs(currentWeekOffset)} week${Math.abs(currentWeekOffset) > 1 ? 's' : ''} ${currentWeekOffset > 0 ? 'forward' : 'ago'}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                  className="border-gold text-gold hover:bg-gold/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'calendar' ? (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-6">
                    {(() => {
                      const getWeekDays = (offset: number) => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - dayOfWeek + (offset * 7));
                        
                        const weekDays = [];
                        for (let i = 0; i < 7; i++) {
                          const day = new Date(startOfWeek);
                          day.setDate(startOfWeek.getDate() + i);
                          weekDays.push(day);
                        }
                        return weekDays;
                      };

                      const weekDays = getWeekDays(currentWeekOffset);
                      
                      return weekDays.map((day, index) => {
                        const dayStr = day.toISOString().split('T')[0];
                        const dayTrades = trades?.filter(trade => trade.date === dayStr) || [];
                        const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                        const isToday = day.toDateString() === new Date().toDateString();
                        
                        return (
                          <div 
                            key={index} 
                            className={`
                              relative p-3 rounded-lg border transition-all duration-300
                              ${isToday ? 'border-gold bg-gold/10' : 'border-gray-700 bg-gray-800/50'}
                              ${dayTrades.length > 0 ? 'hover:scale-105 cursor-pointer' : ''}
                            `}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium text-white mb-1">
                                {day.getDate()}
                              </div>
                              {dayTrades.length > 0 && (
                                <>
                                  <div className={`text-xs font-semibold ${dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${dayPnL >= 0 ? '+' : ''}${dayPnL.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {dayTrades.length} trades
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              ) : (
                <div className="h-64 mb-6">
                  <div className="flex items-end justify-center space-x-2 h-full">
                    {(() => {
                      const getWeekDays = (offset: number) => {
                        const today = new Date();
                        const dayOfWeek = today.getDay();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - dayOfWeek + (offset * 7));
                        
                        const weekDays = [];
                        for (let i = 0; i < 7; i++) {
                          const day = new Date(startOfWeek);
                          day.setDate(startOfWeek.getDate() + i);
                          weekDays.push(day);
                        }
                        return weekDays;
                      };

                      const weekDays = getWeekDays(currentWeekOffset);
                      const maxPnL = Math.max(...weekDays.map(day => {
                        const dayStr = day.toISOString().split('T')[0];
                        const dayTrades = trades?.filter(trade => trade.date === dayStr) || [];
                        return Math.abs(dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
                      }));
                      
                      return weekDays.map((day, index) => {
                        const dayStr = day.toISOString().split('T')[0];
                        const dayTrades = trades?.filter(trade => trade.date === dayStr) || [];
                        const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                        const isToday = day.toDateString() === new Date().toDateString();
                        const barHeight = maxPnL > 0 ? Math.abs(dayPnL) / maxPnL * 200 : 0;
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`
                                w-8 rounded-t transition-all duration-300 hover:scale-110
                                ${dayPnL >= 0 ? 'bg-green-400' : 'bg-red-400'}
                                ${isToday ? 'ring-2 ring-gold' : ''}
                              `}
                              style={{ height: `${Math.max(barHeight, 4)}px` }}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xs text-white font-medium">
                              {day.getDate()}
                            </div>
                            {dayTrades.length > 0 && (
                              <div className={`text-xs font-semibold ${dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${dayPnL >= 0 ? '+' : ''}${dayPnL.toFixed(0)}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
              
              {/* Week Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                {(() => {
                  const getWeekTrades = (offset: number) => {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - dayOfWeek + (offset * 7));
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    const startStr = startOfWeek.toISOString().split('T')[0];
                    const endStr = endOfWeek.toISOString().split('T')[0];
                    
                    return trades?.filter(trade => trade.date >= startStr && trade.date <= endStr) || [];
                  };
                  
                  const weekTrades = getWeekTrades(currentWeekOffset);
                  const weekPnL = weekTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                  const winningTrades = weekTrades.filter(trade => (trade.pnl || 0) > 0).length;
                  const weekWinRate = weekTrades.length > 0 ? (winningTrades / weekTrades.length) * 100 : 0;
                  const bestTrade = weekTrades.length > 0 ? Math.max(...weekTrades.map(t => t.pnl || 0)) : 0;
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${weekPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(weekPnL)}
                        </div>
                        <div className="text-xs text-gray-400">Week P&L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{weekTrades.length}</div>
                        <div className="text-xs text-gray-400">Total Trades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{weekWinRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{formatCurrency(bestTrade)}</div>
                        <div className="text-xs text-gray-400">Best Trade</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}