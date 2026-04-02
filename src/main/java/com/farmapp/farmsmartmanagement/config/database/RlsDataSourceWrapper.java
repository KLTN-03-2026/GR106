package com.farmapp.farmsmartmanagement.config.database;

import javax.sql.DataSource;
import java.io.PrintWriter;
import java.sql.*;
import java.util.logging.Logger;

// Không có @Component — được tạo trong DataSourceConfig
public class RlsDataSourceWrapper implements DataSource {

    private final DataSource dataSource;

    public RlsDataSourceWrapper(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = dataSource.getConnection();
        applyRls(conn);
        return conn;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection conn = dataSource.getConnection(username, password);
        applyRls(conn);
        return conn;
    }

    private void applyRls(Connection conn) throws SQLException {
        if (!RlsContext.isPresent()) return;

        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET app.current_farm_id = '" + RlsContext.getFarmId() + "'");
            stmt.execute("SET app.current_user_id = '" + RlsContext.getUserId() + "'");
        }
    }

    @Override public PrintWriter getLogWriter() throws SQLException { return dataSource.getLogWriter(); }
    @Override public void setLogWriter(PrintWriter out) throws SQLException { dataSource.setLogWriter(out); }
    @Override public void setLoginTimeout(int seconds) throws SQLException { dataSource.setLoginTimeout(seconds); }
    @Override public int getLoginTimeout() throws SQLException { return dataSource.getLoginTimeout(); }
    @Override public Logger getParentLogger() throws SQLFeatureNotSupportedException { return dataSource.getParentLogger(); }
    @Override public <T> T unwrap(Class<T> iface) throws SQLException { return dataSource.unwrap(iface); }
    @Override public boolean isWrapperFor(Class<?> iface) throws SQLException { return dataSource.isWrapperFor(iface); }
}