"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { IoCloseOutline, IoChatbubblesOutline, IoCalendarOutline, IoInformationCircleOutline, IoNotificationsOffOutline } from "react-icons/io5";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications(user?.uid);
  const translation = useTranslation();
  const language = translation?.language || 'en';
  const locale = language === 'ar' ? ar : enUS;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      
      <div className={`fixed top-0 bottom-0 ${language === 'ar' ? 'left-0' : 'right-0'} w-80 md:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 transform`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <p className="text-xs text-gray-400">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-50 rounded-full transition-all text-gray-500"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 gap-4">
              <IoNotificationsOffOutline className="text-5xl" />
              <span className="text-sm font-medium">No notifications yet</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-4 rounded-xl transition-all cursor-pointer border ${
                  notification.read 
                    ? 'bg-white border-gray-50' 
                    : 'bg-primary/[0.03] border-primary/10 shadow-[0_2px_8px_rgba(var(--primary-rgb),0.05)]'
                } hover:border-primary/20 hover:shadow-sm`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.type === 'message' ? 'bg-blue-50 text-blue-500' :
                    notification.type === 'appointment' ? 'bg-green-50 text-green-500' :
                    'bg-amber-50 text-amber-500'
                  }`}>
                    {notification.type === 'message' && <IoChatbubblesOutline className="text-lg" />}
                    {notification.type === 'appointment' && <IoCalendarOutline className="text-lg" />}
                    {notification.type === 'system' && <IoInformationCircleOutline className="text-lg" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={`font-bold text-sm truncate ${notification.read ? 'text-gray-900' : 'text-primary'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5 ml-2"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale })}</span>
                      {notification.link && (
                        <a href={notification.link} className="text-primary hover:underline flex items-center gap-0.5">
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
