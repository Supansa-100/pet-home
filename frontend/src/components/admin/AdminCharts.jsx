import { Grid, Paper, Typography, Box, Stack } from '@mui/material'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, LabelList
} from 'recharts'

// พาเลตต์สีผ่านการตรวจด้วย validator ของ dataviz skill บนพื้นสีขาว
// (ผ่านทุกเช็ค รวมถึงการแยกสีสำหรับผู้ที่ตาบอดสี)
const SERIES_LISTINGS = '#2a78d6' // น้ำเงิน — ประกาศใหม่
const SERIES_ADOPTIONS = '#eb6834' // ส้ม — จับคู่สำเร็จ

// สีของ chrome ในกราฟ ให้จางกว่าเส้นข้อมูลเสมอ
const INK_MUTED = '#898781'
const GRID_LINE = '#e1e0d9'
const AXIS_LINE = '#c3c2b7'

const axisStyle = { fontSize: 12, fill: INK_MUTED }

const ChartCard = ({ title, subtitle, children }) => (
  <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
    <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
)

const EmptyState = ({ message }) => (
  <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography variant="body2" color="text.secondary">{message}</Typography>
  </Box>
)

const AdminCharts = ({ charts }) => {
  const trend = charts?.trend || []
  const categories = charts?.categories || []

  // ถ้าไม่มีความเคลื่อนไหวเลยใน 30 วัน ให้แสดงข้อความแทนกราฟเส้นแบน
  const hasTrendData = trend.some((row) => row.newListings > 0 || row.adoptions > 0)

  const totalListings = categories.reduce((sum, row) => sum + row.value, 0)

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* กราฟเส้น: ประกาศใหม่ เทียบกับ จับคู่สำเร็จ ย้อนหลัง 30 วัน */}
      <Grid item xs={12} lg={7}>
        <ChartCard
          title="ความเคลื่อนไหวย้อนหลัง 30 วัน"
          subtitle="เปรียบเทียบจำนวนประกาศใหม่กับจำนวนการจับคู่สำเร็จ"
        >
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={GRID_LINE} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={{ stroke: AXIS_LINE }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: AXIS_LINE, strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${GRID_LINE}`,
                    fontSize: 13
                  }}
                  labelFormatter={(label) => `วันที่ ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="newListings"
                  name="ประกาศใหม่"
                  stroke={SERIES_LISTINGS}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                />
                <Line
                  type="monotone"
                  dataKey="adoptions"
                  name="จับคู่สำเร็จ"
                  stroke={SERIES_ADOPTIONS}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="ยังไม่มีความเคลื่อนไหวในช่วง 30 วันที่ผ่านมา" />
          )}
        </ChartCard>
      </Grid>

      {/* กราฟแท่งแนวนอน: สัดส่วนชนิดสัตว์
          ใช้แท่งแทนวงกลม เพราะ 6 หมวดหมู่ในกราฟวงกลมต้องใช้ 6 สีที่ผู้ที่ตาบอดสี
          แยกออกจากกันไม่ได้ แท่งแนวนอนอ่านชื่อหมวดจากแกนได้ตรงๆ ไม่ต้องพึ่งสี */}
      <Grid item xs={12} lg={5}>
        <ChartCard
          title="สัดส่วนชนิดสัตว์เลี้ยง"
          subtitle={`จากประกาศทั้งหมด ${totalListings} รายการ`}
        >
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 8, right: 40, bottom: 0, left: 8 }}
                barCategoryGap={8}
              >
                <CartesianGrid stroke={GRID_LINE} horizontal={false} />
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisStyle}
                  tickLine={false}
                  axisLine={{ stroke: AXIS_LINE }}
                  width={72}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${GRID_LINE}`,
                    fontSize: 13
                  }}
                  formatter={(value) => [`${value} รายการ`, 'จำนวนประกาศ']}
                />
                <Bar dataKey="value" fill={SERIES_LISTINGS} radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {/* ติดป้ายตัวเลขที่ปลายแท่ง ไม่ต้องอ่านเทียบกับแกน */}
                  <LabelList
                    dataKey="value"
                    position="right"
                    style={{ fontSize: 12, fill: INK_MUTED }}
                    formatter={(value) =>
                      totalListings > 0
                        ? `${value} (${Math.round((value / totalListings) * 100)}%)`
                        : value
                    }
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="ยังไม่มีข้อมูลประกาศ" />
          )}
        </ChartCard>
      </Grid>

      {/* ตารางข้อมูลสำรอง เพื่อให้อ่านตัวเลขได้แม้มองกราฟไม่ชัด */}
      <Grid item xs={12}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {categories.map((row) => (
            <Box
              key={row.name}
              sx={{
                px: 2, py: 1, borderRadius: 1,
                border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">{row.name}</Typography>
              <Typography variant="body2" fontWeight="bold">{row.value}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
    </Grid>
  )
}

export default AdminCharts
