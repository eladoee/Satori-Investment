export function calculateROI({
  houseTypeData,
  highOccupancy,
  lowOccupancy,
  nightlyHigh,
  nightlyLow,
  monthlyHigh,
  monthlyLow,
  housePrice,
  shortTermFeeRate,
  longTermFeeRate,
}) {

  const shortTermMonthlyDryExpenses =
    houseTypeData.expenses.water +
    houseTypeData.expenses.electricity +
    houseTypeData.expenses.internet +
    houseTypeData.expenses.wearAndTear;

  const commonAreaManagementFee = 60000;

  const shortTermIncome =
    nightlyHigh * 30 * 7 * highOccupancy +
    nightlyLow * 30 * 5 * lowOccupancy;

  const shortTermManagementFee =
    (shortTermIncome * shortTermFeeRate) / 12 + commonAreaManagementFee;

  const shortTermMonthlyExpenses =
    shortTermMonthlyDryExpenses + shortTermManagementFee;

  const shortTermProfit =
    shortTermIncome - shortTermMonthlyExpenses * 12;

  const longTermIncome =
    monthlyHigh * 7 + monthlyLow * 5;

  const longTermMonthlyExpenses =
    (longTermIncome * longTermFeeRate) / 12 + commonAreaManagementFee;

  const longTermProfit =
    longTermIncome - longTermMonthlyExpenses * 12;

  return {
    shortTermManagementFee,
    shortTermMonthlyExpenses,
    shortTermAnnualIncome: shortTermIncome,
    shortTermAnnualProfit: shortTermProfit,
    longTermMonthlyExpenses,
    longTermAnnualIncome: longTermIncome,
    longTermAnnualProfit: longTermProfit,
    houseTypeData,
    housePrice
  };
}