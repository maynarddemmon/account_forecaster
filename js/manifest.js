JS.Packages(function() {with(this) {
    var ROOT = global.ROOT;
    file(ROOT + 'myt.min.js').provides('myt.all');

    // Package:af
    var AF_ROOT = ROOT + 'af/';
    file(AF_ROOT + 'af.js').provides('af').requires('myt.all');

    var AF_MODEL_ROOT = AF_ROOT + 'model/';
    file(AF_MODEL_ROOT + '/Account.js').provides('af.Account').requires('af');
    file(AF_MODEL_ROOT + '/Recurrence.js').provides('af.Recurrence').requires('af');
    file(AF_MODEL_ROOT + '/OneTimeRecurrence.js').provides('af.OneTimeRecurrence').requires('af.Recurrence');
    file(AF_MODEL_ROOT + '/YearlyRecurrence.js').provides('af.YearlyRecurrence').requires('af.Recurrence');
    file(AF_MODEL_ROOT + '/MonthlyRecurrence.js').provides('af.MonthlyRecurrence').requires('af.Recurrence');
    file(AF_MODEL_ROOT + '/WeeklyRecurrence.js').provides('af.WeeklyRecurrence').requires('af.Recurrence');
    file(AF_MODEL_ROOT + '/DailyRecurrence.js').provides('af.DailyRecurrence').requires('af.Recurrence');
    file(AF_MODEL_ROOT + '/Model.js').provides('af.Model').requires(
        'af.OneTimeRecurrence','af.YearlyRecurrence','af.MonthlyRecurrence','af.WeeklyRecurrence','af.DailyRecurrence',
        'af.Account'
    );

    var AF_VIEW_ROOT = AF_ROOT + 'view/';
    file(AF_VIEW_ROOT + '/AccountItemView.js').provides('af.AccountItemView').requires('af');
    file(AF_VIEW_ROOT + '/AccountList.js').provides('af.AccountList').requires('af.AccountItemView');
    file(AF_VIEW_ROOT + '/ItemView.js').provides('af.ItemView').requires('af');
    file(AF_VIEW_ROOT + '/DividerView.js').provides('af.DividerView').requires('af');
    file(AF_VIEW_ROOT + '/RecurrenceItemView.js').provides('af.RecurrenceItemView').requires('af');

    file(AF_ROOT + 'AccountForecaster.js').provides('af.AccountForecaster').requires(
        'af.Model','af.ItemView','af.DividerView','af.RecurrenceItemView','af.AccountList'
    );

    // Include Everything
    file(AF_ROOT + 'all.js').provides('af.all').requires(
        'af.AccountForecaster'
    );
}});
