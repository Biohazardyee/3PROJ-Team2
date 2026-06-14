const StatCard = ({icon: Icon, value, label, badge, isUrgent}: any) => (
    <div
        className={`bg-[#1a1d26] dark:bg-white border ${isUrgent ? 'border-rose-500/50' : 'border-slate-800 dark:border-gray-200'} rounded-xl p-5 relative overflow-hidden transition-all hover:border-slate-700 dark:hover:border-gray-300 shadow-sm`}>
        <div className="flex justify-between items-start mb-4">
            <div
                className={`${isUrgent ? 'text-rose-500 bg-rose-500/10' : 'text-blue-500 bg-blue-500/10 dark:bg-blue-50'} p-2 rounded-lg`}>
                <Icon size={20}/>
            </div>
            <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-rose-500 text-white`}>
        {badge}
      </span>
        </div>
        <div className="text-3xl font-bold text-white dark:text-gray-900 mb-1">{value.toLocaleString()}</div>
        <div className="text-slate-500 dark:text-gray-500 text-sm font-medium">{label}</div>
    </div>
);

export default StatCard;